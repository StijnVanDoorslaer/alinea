//import {EntryProperty} from '../draft/EntryProperty.js'
//import {useCurrentDraft} from '../hook/UseCurrentDraft.js'
import styler from '@alinea/styler'
import {Entry} from 'alinea/core/Entry'
import type {EntryFields} from 'alinea/core/EntryFields'
import type {Filter} from 'alinea/core/Filter'
import type {QueryWithResult} from 'alinea/core/Graph'
import type {RootData} from 'alinea/core/Root'
import {workspaceMediaDir} from 'alinea/core/util/EntryFilenames'
import {EntryHeader} from 'alinea/dashboard/view/entry/EntryHeader'
import {select} from 'alinea/field'
import {SelectInput} from 'alinea/field/select/SelectField.view'
import {Button, HStack, Icon, TextLabel, VStack} from 'alinea/ui'
import {IcRoundAdd} from 'alinea/ui/icons/IcRoundAdd'
import {IcRoundArrowBack} from 'alinea/ui/icons/IcRoundArrowBack'
import {IcRoundUnfoldMore} from 'alinea/ui/icons/IcRoundUnfoldMore'
import {IcTwotoneFolder} from 'alinea/ui/icons/IcTwotoneFolder'
import {Main} from 'alinea/ui/Main'
import {useMemo} from 'react'
import {useQuery} from 'react-query'
import type {EntryEditor} from '../atoms/EntryEditorAtoms.js'
import {useNavigate} from '../atoms/LocationAtoms.js'
import {useConfig} from '../hook/UseConfig.js'
import {useGraph} from '../hook/UseGraph.js'
import {useNav} from '../hook/UseNav.js'
import {useRoot} from '../hook/UseRoot.js'
import {useWorkspace} from '../hook/UseWorkspace.js'
import {Head} from '../util/Head.js'
import {Explorer, type ExporerItemSelect} from './explorer/Explorer.js'
import {IconLink} from './IconButton.js'
import css from './MediaExplorer.module.scss'
import {FileUploader} from './media/FileUploader.js'
import {SearchBox} from './SearchBox.js'

const styles = styler(css)

export interface MediaExplorerProps {
  editor?: EntryEditor
  root?: RootData
}

export function MediaExplorer({editor}: MediaExplorerProps) {
  const config = useConfig()
  const parentId = editor?.entryId
  const workspace = useWorkspace()
  const root = useRoot()
  const graph = useGraph()
  const condition = useMemo((): Filter<EntryFields> => {
    return {
      _root: root.name,
      _workspace: workspace.name,
      _parentId: parentId ?? null
    }
  }, [workspace, root, parentId])
  const {data} = useQuery(
    ['explorer', 'media', 'total', condition],
    async () => {
      const query: QueryWithResult<ExporerItemSelect> = {
        select: undefined!,
        orderBy: [{desc: Entry.type}, {desc: Entry.id}],
        filter: condition
      }
      const info =
        parentId &&
        (await graph.first({
          select: {
            title: Entry.title,
            parent: Entry.parentId
          },
          id: parentId,
          status: 'preferDraft'
        }))
      return {...info, query}
    },
    {suspense: true, keepPreviousData: true}
  )
  const {query} = data!
  const title = data?.title || root.label
  const nav = useNav()
  const navigate = useNavigate()
  const backLink = data?.parent
    ? nav.entry({id: data.parent})
    : editor
      ? nav.root({root: root.name})
      : undefined

  return (
    <Main className={styles.root()} scrollable={false}>
      {editor && <EntryHeader editable={false} editor={editor} />}
      <div className={styles.root.inner()}>
        <HStack style={{flexGrow: 1, minHeight: 0}}>
          <VStack style={{height: '100%', width: '100%'}}>
            <header className={styles.root.inner.header()}>
              <Head>
                <title>{`${workspace.label}: ${String(title)}`}</title>
              </Head>
              <HStack gap={18} center>
                {backLink && (
                  <IconLink icon={IcRoundArrowBack} href={backLink} />
                )}
                <HStack
                  align="center"
                  justify="space-between"
                  style={{width: '100%'}}
                >
                  <div>
                    <h1 className={styles.root.title()}>
                      <TextLabel label={title + ' library'} />
                    </h1>
                    <p>3 folders - 11 entries</p>
                  </div>
                  <HStack gap={16} align="center" justify="space-between">
                    <Button
                      icon={IcRoundAdd}
                      style={{
                        background: 'var(--alinea-selected)',
                        color: 'var(--alinea-selected-foreground)'
                      }}
                    >
                      Add new folder
                    </Button>
                    <Button icon={IcRoundAdd}>Upload new media</Button>
                  </HStack>
                </HStack>
              </HStack>
            </header>
            <div style={{paddingInline: '40px', marginBottom: 32}}>
              <HStack align="flex-end" justify="space-between">
                <SearchBox style={{padding: 0, width: 460, height: 36}} />
                <HStack gap={16}>
                  {[
                    {label: 'Sort by', input: 'Latest'},
                    {label: 'Filter by', input: 'Media type'}
                  ].map(({label, input}, index) => (
                    <div key={index}>
                      <p
                        className="alinea-InputLabel-header"
                        style={{display: 'block', fontWeight: 600}}
                      >
                        {label}
                      </p>
                      <div className="alinea-SelectField">
                        <div
                          className="alinea-SelectField-input"
                          style={{minWidth: 120}}
                        >
                          <button
                            type="button"
                            className="alinea-SelectField-input-button"
                            style={{justifyContent: 'space-between'}}
                          >
                            {input}
                            <IcRoundUnfoldMore className="alinea-SelectField-input-icon alinea-Icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </HStack>
              </HStack>
            </div>
            <div style={{paddingInline: '40px', marginBottom: 32}}>
              <h2>Folders</h2>
              <div
                style={{
                  gap: 16,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gridAutoFlow: 'dense',
                  marginTop: 8
                }}
              >
                {Array.from(Array(3)).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      gap: 12,
                      display: 'flex',
                      alignItems: 'center',
                      padding: 10,
                      background: 'var(--alinea-background)',
                      borderRadius: 4,
                      boxShadow: '0 1px 4px 0 rgba(26, 26, 67, 0.1)'
                    }}
                  >
                    <span
                      style={{
                        background: 'var(--alinea-selected)',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        color: 'var(--alinea-selected-foreground)',
                        fontSize: 20
                      }}
                    >
                      <IcTwotoneFolder />
                    </span>
                    <div>
                      {i === 0
                        ? 'Articles'
                        : i === 1
                          ? 'Documents'
                          : 'Testimonials'}
                      <p style={{color: 'gray', fontSize: 12}}>8 entries</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Explorer
              query={query}
              type="thumb"
              virtualized
              onNavigate={id => navigate(nav.entry({id: id}))}
            />
          </VStack>
        </HStack>
        <FileUploader
          destination={{
            parentId,
            workspace: workspace.name,
            root: root.name,
            directory: workspaceMediaDir(config, workspace.name)
          }}
        />
      </div>
    </Main>
  )
}
