import {Config, Root, Syncable, createError} from 'alinea/core'
import * as path from 'alinea/core/util/Paths'
import {timer} from 'alinea/core/util/Timer'
import {Driver, Table, alias, create} from 'rado'
import xxhash from 'xxhash-wasm'
import {Entry, EntryStatus} from '../core/Entry.js'
import {Selection} from '../core/pages/Selection.js'
import {Resolver} from './Resolver.js'
import {SourceEntry} from './Source.js'
import {Store} from './Store.js'
import {AlineaMeta} from './db/AlineaMeta.js'
import {entryData} from './db/EntryData.js'

const decoder = new TextDecoder()

export class Database implements Syncable {
  resolve: <T>(selection: Selection<T>) => Promise<T>

  constructor(public store: Store, public config: Config) {
    this.resolve = new Resolver(store, config.schema).resolve
  }

  find<S>(selection: S) {
    return this.resolve(Selection(selection)) as Promise<Selection.Infer<S>>
  }

  async updates(request: AlineaMeta) {
    const current = await this.meta()
    if (current.contentHash === request.contentHash)
      return {
        contentHash: current.contentHash,
        entries: []
      }
    return {
      contentHash: current.contentHash,
      entries: await this.store(
        Entry().where(Entry.modifiedAt.isGreater(request.modifiedAt))
      )
    }
  }

  async ids(): Promise<Array<string>> {
    return this.store(Entry().select(Entry.versionId))
  }

  entriesOf(query: Driver.Async, versionIds: Array<string>) {
    return query(
      Entry().select(Entry.entryId).where(Entry.versionId.isIn(versionIds))
    )
  }

  // Syncs data with a remote database, returning the ids of changed entries
  async syncWith(remote: Syncable): Promise<Array<string>> {
    await this.init()
    const update = await remote.updates(await this.meta())
    if (update instanceof Uint8Array) {
      // Replace db with remote
      throw new Error('Todo: replace db with remote')
    }
    const {contentHash, entries} = update
    if (entries.length) await this.updateEntries(entries)
    const updated = await this.meta()
    const changedEntries = await this.entriesOf(
      this.store,
      entries.map(e => e.versionId)
    )
    if (updated.contentHash === contentHash) return changedEntries
    const remoteIds = await remote.ids()
    const excessEntries = await this.store.transaction(async query => {
      const excess = await query(
        Entry()
          .select(Entry.versionId)
          .where(
            remoteIds.length > 0 ? Entry.versionId.isNotIn(remoteIds) : true
          )
      )
      await query(Entry().delete().where(Entry.versionId.isIn(excess)))
      await this.index(query)
      await this.writeMeta(query)
      return this.entriesOf(query, excess)
    })
    const afterRemoves = await this.meta()
    if (afterRemoves.contentHash === contentHash)
      return changedEntries.concat(excessEntries)
    // Todo: we should abandon syncing and just fetch the full db
    throw createError('Sync failed')
  }

  async updateEntries(entries: Array<Entry>) {
    return this.store.transaction(async query => {
      const ids = entries.map(e => e.versionId)
      await query(Entry().delete().where(Entry.versionId.isIn(ids)))
      for (const entry of entries) {
        await query(Entry().insertOne(entry))
      }
      await this.index(query)
      await this.writeMeta(query)
    })
  }

  async meta() {
    return (
      (await this.store(AlineaMeta().maybeFirst())) ?? {
        contentHash: '',
        modifiedAt: 0
      }
    )
  }

  private async index(query: Driver.Async) {
    const {Parent} = alias(Entry)
    const res = await query(
      Entry().set({
        parent: Parent({childrenDir: Entry.parentDir})
          .select(Parent.entryId)
          .maybeFirst()
      })
    )
    return res
  }

  private async writeMeta(query: Driver.Async) {
    const {h32ToString} = await xxhash()
    const contentHashes = await query(
      Entry().select(Entry.contentHash).orderBy(Entry.contentHash)
    )
    const contentHash = h32ToString(contentHashes.join(''))
    const modifiedAt = await query(
      Entry().select(Entry.modifiedAt).orderBy(Entry.modifiedAt.desc()).first()
    )
    await query(
      AlineaMeta().delete(),
      AlineaMeta().insertOne({
        modifiedAt,
        contentHash
      })
    )
  }

  inited = false
  private async init() {
    if (this.inited) return
    this.inited = true
    try {
      await this.store.transaction(async query => {
        await query(create(Entry, AlineaMeta))
      })
    } catch (e) {
      this.inited = false
      throw e
    }
  }

  computeEntry(
    file: SourceEntry
    // contentHash: string
  ): Omit<Table.Insert<typeof Entry>, 'contentHash'> {
    const data =
      file.contents instanceof Uint8Array
        ? JSON.parse(decoder.decode(file.contents))
        : file.contents
    const parentDir = path.dirname(file.filePath)
    const extension = path.extname(file.filePath)
    const fileName = path.basename(file.filePath, extension)
    const segments = parentDir.split('/')
    const root = Root.data(this.config.workspaces[file.workspace][file.root])
    let locale: string | null = null

    if (root.i18n) {
      locale = segments.shift()!
      if (!root.i18n.locales.includes(locale))
        throw new Error(`invalid locale: "${locale}"`)
    }

    const type = this.config.schema[data.type]
    if (!type) throw new Error(`invalid type: "${data.type}"`)
    const childrenDir = path.join(parentDir, fileName)

    if (!data.id) throw new Error(`missing id`)

    return {
      workspace: file.workspace,
      root: file.root,
      filePath: file.filePath,
      // contentHash,

      modifiedAt: file.modifiedAt,
      // todo: infer draft
      status: EntryStatus.Published,

      entryId: data.id,
      type: data.type,

      parentDir,
      childrenDir,
      parent: null,
      index: null,
      locale,
      i18nId: data.alinea?.i18n?.id,

      path: fileName,
      title: data.title ?? '',
      url: '',

      data: entryData(type, data)
    }
  }

  async fill(files: AsyncGenerator<SourceEntry>): Promise<void> {
    const {h32Raw} = await xxhash()
    await this.init()
    return this.store.transaction(async query => {
      const seen: Array<string> = []
      let inserted = 0
      const endScan = timer('Scanning entries')
      for await (const file of files) {
        if (!(file.contents instanceof Uint8Array))
          throw new Error(`Cannot fill with non-binary content`)
        const contentHash = h32Raw(file.contents).toString(16).padStart(8, '0')
        const exists = await query(
          Entry({
            contentHash,
            filePath: file.filePath,
            workspace: file.workspace,
            root: file.root
          })
            .select(Entry.versionId)
            .maybeFirst()
        )
        // Todo: a config change but unchanged entry data will currently
        // fly under the radar
        if (exists) {
          seen.push(exists)
          continue
        }
        try {
          const entry = this.computeEntry(file)
          const withHash = entry as Table.Insert<typeof Entry>
          withHash.contentHash = contentHash
          seen.push(
            await query(Entry().insert(withHash).returning(Entry.versionId))
          )
          inserted++
        } catch (e: any) {
          console.log(`> skipped ${file.filePath} — ${e.message}`)
        }
      }
      endScan(`Scanned ${seen.length} entries`)
      if (seen.length === 0) return
      const {rowsAffected: removed} = await query(
        Entry().delete().where(Entry.versionId.isNotIn(seen))
      )
      const noChanges = inserted === 0 && removed === 0
      if (noChanges) return

      const endIndex = timer('Indexing entries')
      await this.index(query)
      endIndex()
      await this.writeMeta(query)
    })
  }
}
