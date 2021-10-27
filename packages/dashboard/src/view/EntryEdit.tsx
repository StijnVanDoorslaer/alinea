import {Entry, EntryStatus} from '@alinea/core'
import {
  CurrentDraftProvider,
  EntryDraft,
  EntryDraftStatus,
  Fields,
  useCurrentDraft,
  useDraft,
  useInput
} from '@alinea/editor'
import {
  AppBar,
  Chip,
  fromModule,
  HStack,
  Pane,
  px,
  Stack,
  Statusbar,
  Typo
} from '@alinea/ui'
import {ComponentType, Suspense, useEffect, useState} from 'react'
import {Helmet} from 'react-helmet'
import {
  MdArchive,
  MdCheck,
  MdEdit,
  MdPublish,
  MdRotateLeft
} from 'react-icons/md/index'
import {useQuery} from 'react-query'
import {useDashboard} from '../hook/UseDashboard'
import {useSession} from '../hook/UseSession'
import css from './EntryEdit.module.scss'

type EntryStatusChipProps = {
  status: EntryStatus
}

function EntryStatusChip({status}: EntryStatusChipProps) {
  switch (status) {
    case EntryStatus.Published:
      return <Chip icon={MdCheck}>Published</Chip>
    case EntryStatus.Draft:
      return <Chip icon={MdEdit}>Draft</Chip>
    case EntryStatus.Archived:
      return <Chip icon={MdArchive}>Archived</Chip>
  }
}

const styles = fromModule(css)

function EntryEditHeader() {
  const {schema} = useDashboard()
  const session = useSession()
  const [draft] = useCurrentDraft()
  const [typeKey] = useInput(EntryDraft.type)
  const [status = EntryStatus.Published] = useInput(EntryDraft.$status)
  const type = schema.type(typeKey)
  const [isPublishing, setPublishing] = useState(false)
  function handlePublish() {
    setPublishing(true)
    console.log(draft.getEntry())
    return session.hub.content.publish([draft.getEntry()]).finally(() => {
      setPublishing(false)
    })
  }
  return (
    <AppBar.Root>
      <AppBar.Item full style={{flexGrow: 1}}>
        <Typo.Monospace
          style={{
            display: 'block',
            width: '100%',
            background: 'var(--highlight)',
            padding: `${px(8)} ${px(15)}`,
            borderRadius: px(8)
          }}
        >
          {draft.$path}
        </Typo.Monospace>
      </AppBar.Item>
      <Stack.Right>
        <AppBar.Item>
          <EntryStatusChip status={status} />
        </AppBar.Item>
      </Stack.Right>
      {status !== EntryStatus.Published && !isPublishing && (
        <AppBar.Item as="button" icon={MdPublish} onClick={handlePublish}>
          Publish
        </AppBar.Item>
      )}
      {isPublishing && (
        <AppBar.Item as="button" icon={MdRotateLeft}>
          Publishing...
        </AppBar.Item>
      )}
      {/*<Tabs.Root defaultValue="type">
        <Tabs.List>
          <Tabs.Trigger value="type">
            {type?.label && <TextLabel label={type?.label} />}
          </Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>*/}
    </AppBar.Root>
  )
}

function EntryTitle() {
  const [title] = useInput(EntryDraft.title)
  return (
    <h1 style={{position: 'relative', zIndex: 1, paddingBottom: '10px'}}>
      {title}
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </h1>
  )
}

type EntryEditStatusProps = {
  status: EntryDraftStatus
}

function EntryEditStatus({status}: EntryEditStatusProps) {
  switch (status) {
    case EntryDraftStatus.Synced:
      return <Statusbar.Status icon={MdCheck}>Synced</Statusbar.Status>
    case EntryDraftStatus.Pending:
      return <Statusbar.Status icon={MdEdit}>Editing</Statusbar.Status>
    case EntryDraftStatus.Saving:
      return <Statusbar.Status icon={MdRotateLeft}>Saving</Statusbar.Status>
  }
}

type EntryPreviewProps = {
  draft: EntryDraft
  preview: ComponentType<{entry: Entry}>
}

function EntryPreview({draft, preview: Preview}: EntryPreviewProps) {
  const [entry, setEntry] = useState(draft.getEntry())
  useEffect(() => {
    setEntry(draft.getEntry())
    return draft.watchChanges(() => setEntry(draft.getEntry()))
  }, [Preview, draft])
  return <Preview entry={entry} />
}

type EntryEditDraftProps = {}

function EntryEditDraft({}: EntryEditDraftProps) {
  const session = useSession()
  const [draft, status] = useCurrentDraft()!
  const type = session.hub.schema.type(draft.type)
  const {preview} = useDashboard()
  return (
    <HStack style={{height: '100%'}}>
      <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <EntryEditHeader />
        <div className={styles.draft()}>
          <EntryTitle />

          <Suspense fallback={null}>
            {type ? <Fields type={type} /> : 'Channel not found'}
          </Suspense>

          <Statusbar.Slot>
            <EntryEditStatus status={status} />
          </Statusbar.Slot>
        </div>
      </div>
      {preview && (
        <Pane id="preview" resizable="left" defaultWidth={330} minWidth={320}>
          <EntryPreview preview={preview} draft={draft} />
        </Pane>
      )}
    </HStack>
  )
}

export type EntryEditProps = {id: string}

export function EntryEdit({id}: EntryEditProps) {
  const {hub} = useSession()
  const {isLoading, data} = useQuery(
    ['entry', id],
    () => hub.content.entryWithDraft(id),
    {refetchOnWindowFocus: false}
  )
  const type = hub.schema.type(data?.entry.type)
  const draft = useDraft(type!, data!, doc => {
    return hub.content.putDraft(id, doc)
  })
  if (!draft) return null
  return (
    <>
      <CurrentDraftProvider value={draft}>
        <EntryEditDraft />
      </CurrentDraftProvider>
    </>
  )
}
