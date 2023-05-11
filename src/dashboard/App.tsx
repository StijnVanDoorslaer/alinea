import {Config, renderLabel, Root} from 'alinea/core'
import {Client} from 'alinea/core/Client'
import {useParams, useRoutes} from 'alinea/dashboard/util/HashRouter'
import {ErrorBoundary, FavIcon, Loader} from 'alinea/ui'
import {IcRoundInsertDriveFile} from 'alinea/ui/icons/IcRoundInsertDriveFile'
import {atom, useAtom, useAtomValue} from 'jotai'
import {Suspense, useMemo} from 'react'
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider
} from 'react-query'
import {
  queryClientAtom,
  sessionAtom,
  useSetDashboardOptions
} from './atoms/DashboardAtoms.js'

import {useDbUpdater} from './atoms/EntryAtoms.js'
import {locationAtom, matchAtoms} from './atoms/RouterAtoms.js'
import {navMatchers} from './DashboardNav.js'
import {useDashboard} from './hook/UseDashboard.js'
import {useEntry} from './hook/UseEntry.js'
import {useEntryLocation} from './hook/UseEntryLocation.js'
import {useLocale} from './hook/UseLocale.js'
import {useNav} from './hook/UseNav.js'
import {useRoot} from './hook/UseRoot.js'
import {useWorkspace} from './hook/UseWorkspace.js'
import {Head} from './util/Head.js'
import {DraftsOverview} from './view/DraftsOverview.js'
import {RootOverview} from './view/RootOverview.js'
import {Sidebar} from './view/Sidebar.js'
import {Toolbar} from './view/Toolbar.js'
import {Viewport} from './view/Viewport.js'

/*function DraftsButton() {
  const location = useLocation()
  const nav = useNav()
  const {name: workspace} = useWorkspace()
  const {name: root} = useRoot()
  const {total: draftsTotal} = useDraftsList(workspace)
  const entryLocation = useEntryLocation()
  const link =
    entryLocation && entryLocation.root === root 
      ? nav.draft(entryLocation)
      : nav.draft({workspace})
  return (
    <Sidebar.Nav.Item
      selected={location.pathname.startsWith(nav.draft({workspace}))}
      href={link}
      title="Drafts"
      aria-label="Drafts"
      badge={draftsTotal}
    >
      <MdiSourceBranch />
    </Sidebar.Nav.Item>
  )
}*/

const isEntryAtom = atom(get => {
  const location = get(locationAtom)
  const match = get(matchAtoms({route: navMatchers.matchEntry}))
  return Boolean(match) || location.pathname === '/'
})

function AppAuthenticated() {
  const {fullPage} = useDashboard()
  const nav = useNav()
  const isEntry = useAtomValue(isEntryAtom)
  const {name: workspace, color, roots} = useWorkspace()
  const {name: currentRoot} = useRoot()
  const entryLocation = useEntryLocation()
  const routes = useMemo(() => {
    return {
      [nav.draft({
        workspace: ':workspace',
        root: ':root?',
        id: ':id?'
      })]: <DraftsOverview />,
      [nav.entry({
        workspace: ':workspace?',
        root: ':root?',
        id: ':id?'
      })]: <RootView />
    }
  }, [nav])
  const match = useRoutes(routes)
  return (
    <Toolbar.Provider>
      <Sidebar.Provider>
        <Viewport attachToBody={fullPage} contain color={color}>
          <Head>
            <FavIcon color={color} />
          </Head>
          <Toolbar.Root />
          <div
            style={{
              flex: '1',
              display: 'flex',
              minHeight: 0,
              position: 'relative'
            }}
          >
            <Sidebar.Nav>
              {Object.entries(roots).map(([key, root], i) => {
                const isSelected = key === currentRoot
                const link =
                  entryLocation && entryLocation.root === key
                    ? nav.entry(entryLocation)
                    : nav.root({workspace, root: key})
                const {label, icon: Icon} = Root.data(root)
                return (
                  <Sidebar.Nav.Item
                    key={key}
                    selected={isEntry && isSelected}
                    href={link}
                    title={renderLabel(label)}
                    aria-label={renderLabel(label)}
                  >
                    {Icon ? <Icon /> : <IcRoundInsertDriveFile />}
                  </Sidebar.Nav.Item>
                )
              })}
              {/*<DraftsButton />*/}
            </Sidebar.Nav>
            <Suspense fallback={<Loader absolute />}>
              <ErrorBoundary>
                {match ? match.element : <RootView />}
              </ErrorBoundary>
            </Suspense>
          </div>
        </Viewport>
      </Sidebar.Provider>
    </Toolbar.Provider>
  )
}

function RootView() {
  const {id} = useParams()
  const workspace = useWorkspace()
  const root = useRoot()
  if (id) return <EntryView id={id} />
  return (
    <>
      <Head>
        <title>{renderLabel(workspace.label)}</title>
      </Head>
      <RootOverview workspace={workspace} root={root} />
    </>
  )
}

interface EntryViewProps {
  id: string
}

function EntryView({id}: EntryViewProps) {
  useDbUpdater()
  const workspace = useWorkspace()
  const root = useRoot()
  const locale = useLocale()
  const entry = useEntry(id)
  console.log(entry)
  return <div>entry</div>
  const {draft} = useDraft(id)
  const isLoading = Boolean(
    draft?.id !== id && locale && draft?.alinea.i18n?.locale !== locale
  )
  const {search} = useAtomValue(locationAtom)
  const type = draft?.channel
  const View = (type && Type.meta(type).view) || EntryEdit
  const select = ([] as Array<string | undefined>)
    .concat(draft?.alinea.parents)
    .concat(draft?.id)
    .filter(Boolean) as Array<string>
  return (
    <CurrentDraftProvider value={draft}>
      <Sidebar.Tree>
        <SearchBox />
        <RootHeader />
        content tree
      </Sidebar.Tree>
      {search === '?new' && (
        <Suspense fallback={<Loader absolute />}>
          <NewEntry parentId={id} />
        </Suspense>
      )}
      {draft ? (
        <Suspense fallback={<Loader absolute />}>
          <View
            key={draft.id}
            initialMode={EditMode.Editing}
            draft={draft}
            isLoading={isLoading}
          />
        </Suspense>
      ) : (
        <>
          <Head>
            <title>{renderLabel(workspace.label)}</title>
          </Head>
          <RootOverview workspace={workspace} root={root} />
        </>
      )}
    </CurrentDraftProvider>
  )
}

function AppRoot() {
  const [session, setSession] = useAtom(sessionAtom)
  const {fullPage, config} = useDashboard()
  const {color} = Config.mainWorkspace(config)
  const Auth = config.backend?.auth?.view
  if (!session)
    return (
      <Viewport attachToBody={fullPage} contain color={color}>
        <Head>
          <FavIcon color={color} />
        </Head>
        {Auth && (
          <Suspense fallback={<Loader absolute />}>
            <Auth setSession={setSession} />
          </Suspense>
        )}
      </Viewport>
    )
  return <AppAuthenticated />
}

// facebook/react#24304
const QueryClientProvider: any = ReactQueryClientProvider

export interface AppProps {
  config: Config
  client: Client
  queryClient?: QueryClient
  fullPage?: boolean
}

export function App({fullPage = true, ...props}: AppProps) {
  useSetDashboardOptions(props)
  const queryClient = useAtomValue(queryClientAtom)
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  )
}
