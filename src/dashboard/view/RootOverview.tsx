import styler from '@alinea/styler'
import type {RootData} from 'alinea/core/Root'
import {object} from 'alinea/field.js'
import {HStack, Icon, TextLabel, Typo, VStack} from 'alinea/ui'
import {IcRoundDescription} from 'alinea/ui/icons/IcRoundDescription'
import {IcRoundInsertDriveFile} from 'alinea/ui/icons/IcRoundInsertDriveFile'
import {Lift} from 'alinea/ui/Lift'
import {Main} from 'alinea/ui/Main'
import Image from 'next/image'
import {useWorkspace} from '../hook/UseWorkspace.js'
import {Head} from '../util/Head.js'
import css from './RootOverview.module.scss'
import {SearchBox} from './SearchBox.js'

const styles = styler(css)

export interface RootOverviewProps {
  root: RootData
}

const examplePages = [
  {
    title: 'Home',
    url: '/en',
    type: 'HomeSchema',
    lastModified: '05/01/2026'
  },
  {
    title: 'About us',
    url: '/en/about',
    type: 'PageSchema',
    lastModified: '04/01/2026'
  },
  {
    title: 'Services',
    url: '/en/services',
    type: 'PageSchema',
    lastModified: '03/01/2026'
  },
  {
    title: 'News',
    url: '/en/news',
    type: 'NewsSchema',
    lastModified: '02/01/2026'
  },
  {
    title: 'FAQ',
    url: '/en/faq',
    type: 'PageSchema',
    lastModified: '01/01/2026'
  }
]

const exampleImages = [
  {
    url: 'https://picsum.photos/64',
    title: 'artem-stoliar-CF-2tl6MQj0-unsplash',
    extension: 'jpg'
  },
  {
    url: 'https://picsum.photos/64',
    title: 'nir-himi-KSlJhcpDaQk-unsplash',
    extension: 'png'
  },
  {
    url: 'https://picsum.photos/64',
    title: 'ingmar-h-SvFFr464urs-unsplash',
    extension: 'jpg'
  }
]

const exampleFiles = [
  {
    title: 'lorem-ipsum-dolor-sit-amet',
    extension: 'pdf'
  },
  {
    title: 'consectetur-adipiscing-elit',
    extension: 'pdf'
  },
  {
    title: 'nullam mi est, mollis vel tortor non',
    extension: 'docx'
  }
]

export function RootOverview({root}: RootOverviewProps) {
  const workspace = useWorkspace()
  return (
    <>
      <Head>
        <title>{`${workspace.label}: ${root.label}`}</title>
      </Head>
      <Main>
        <Main.Container className={styles.root()}>
          <div className={styles.root.intro()}>
            <Typo.H1>
              <TextLabel label="Welcome" />
            </Typo.H1>
            <Typo.P className={styles.root.intro.text()}>
              This dashboard gives you direct access to your content and media.
              Use the navigation on the left to manage pages.
            </Typo.P>
          </div>
          <SearchBox style={{padding: 0, width: '100%'}} />
          <Lift className={styles.root.lift()}>
            <HStack gap={64} wrap>
              <VStack gap={8} style={{flex: '1 1 320px'}}>
                <Typo.H2
                  style={{
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--alinea-outline)'
                  }}
                >
                  <TextLabel label="Last modified pages" />
                </Typo.H2>
                <table className={styles.root.lift.table()}>
                  <thead>
                    <tr>
                      <th>Last modified</th>
                      <th>Page title</th>
                      <th>Page url</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examplePages.map(page => (
                      <tr key={page.url}>
                        <td>{page.lastModified}</td>
                        <td>{page.title}</td>
                        <td>{page.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VStack>
              <VStack gap={8} style={{flex: '1 1 320px'}}>
                <Typo.H2
                  style={{
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--alinea-outline)'
                  }}
                >
                  <TextLabel label="Most edited pages" />
                </Typo.H2>
                <table className={styles.root.lift.table()}>
                  <thead>
                    <tr>
                      <th>Page title</th>
                      <th>Page url</th>
                      <th>Page type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examplePages.map(page => (
                      <tr key={page.url}>
                        <td>{page.title}</td>
                        <td>{page.url}</td>
                        <td>{page.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VStack>
            </HStack>
          </Lift>
          <Lift className={styles.root.lift()}>
            <HStack gap={64} wrap>
              <VStack gap={8} style={{flex: '1 1 320px'}}>
                <Typo.H2
                  style={{
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--alinea-outline)'
                  }}
                >
                  <TextLabel label="Last uploaded images" />
                </Typo.H2>
                {exampleImages.map((image, index) => (
                  <div className={styles.listItem()} key={index}>
                    <div className={styles.listItem.image()}>
                      <img
                        src={image.url}
                        width={64}
                        height={64}
                        style={{objectFit: 'cover'}}
                      />
                    </div>
                    {image.title}.{image.extension}
                  </div>
                ))}
              </VStack>
              <VStack gap={8} style={{flex: '1 1 320px'}}>
                <Typo.H2
                  style={{
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--alinea-outline)'
                  }}
                >
                  <TextLabel label="Last uploaded files" />
                </Typo.H2>
                {exampleFiles.map((file, index) => (
                  <div className={styles.listItem()} key={index}>
                    <div className={styles.listItem.file(file.extension)}>
                      <Icon icon={IcRoundInsertDriveFile} size={32} />
                    </div>
                    {file.title}.{file.extension}
                  </div>
                ))}
              </VStack>
            </HStack>
          </Lift>
        </Main.Container>
      </Main>
    </>
  )
}
