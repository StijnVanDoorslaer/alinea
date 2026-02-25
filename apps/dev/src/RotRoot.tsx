import styler from '@alinea/styler'
import {HStack, Icon, TextLabel, Typo} from 'alinea/ui'
import {IcRoundCheck} from 'alinea/ui/icons/IcRoundCheck'
import {IcRoundTrendingDown} from 'alinea/ui/icons/IcRoundTrendingDown'
import {IcRoundTrendingUp} from 'alinea/ui/icons/IcRoundTrendingUp'
import {IcRoundWarning} from 'alinea/ui/icons/IcRoundWarning'
import {Lift} from 'alinea/ui/Lift'
import {Main} from 'alinea/ui/Main'
import Head from 'next/head'
import css from './RotRoot.module.css'

const styles = styler(css)

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function parseDayMonthYear(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

const pages = [
  {
    title: 'Home',
    url: '/en',
    status: 'Published',
    lastModified: '01/01/2026',
    publicationDate: '01/01/2026'
  },
  {
    title: 'About us',
    url: '/en/about',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '02/01/2026',
    publicationDate: '06/06/2025'
  },
  {
    title: 'Services',
    url: '/en/services',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '03/01/2025',
    publicationDate: '01/01/2025'
  },
  {
    title: 'Our Team',
    url: '/en/team',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '04/01/2025',
    publicationDate: '06/06/2024'
  },
  {
    title: 'Portfolio',
    url: '/en/portfolio',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '05/01/2024',
    publicationDate: '01/01/2024'
  },
  {
    title: 'News',
    url: '/en/news',
    status: 'Published',
    type: 'NewsSchema',
    lastModified: '06/01/2024',
    publicationDate: '06/06/2023'
  },
  {
    title: 'News detail',
    url: '/en/news/detail',
    status: 'Published',
    type: 'NewsDetailSchema',
    lastModified: '07/01/2023',
    publicationDate: '01/01/2023',
    pageViews: 75
  },
  {
    title: 'FAQ',
    url: '/en/faq',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '08/01/2026',
    publicationDate: '06/06/2022'
  },
  {
    title: 'Contact',
    url: '/en/contact',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '09/01/2025',
    publicationDate: '01/01/2022'
  },
  {
    title: 'Privacy Policy',
    url: '/en/privacy-policy',
    status: 'Published',
    type: 'PageSchema',
    lastModified: '10/01/2023',
    publicationDate: '06/06/2021'
  },
  {
    title: 'Campaign',
    url: '/en/campaign',
    status: 'Unpublished',
    lastModified: '11/01/2024',
    publicationDate: '01/01/2024',
    pageViews: 99
  },
  {
    title: 'Test',
    url: '/en/test',
    status: 'Published',
    lastModified: '12/01/2020',
    publicationDate: '01/01/2021',
    pageViews: 0
  }
]

export function RotRoot() {
  return (
    <>
      <Head>
        <title>ROT analysis</title>
      </Head>
      <Main>
        <Main.Container className={styles.root()}>
          <div className={styles.intro()}>
            <Typo.H1>
              <TextLabel label="ROT analysis" />
            </Typo.H1>
            <Typo.P className={styles.introText()}>
              A ROT analysis (Redundant, Outdated/Obsolete, and Trivial) is a
              content audit process used to identify and remove useless data,
              improving website performance, SEO, and user experience.
            </Typo.P>
          </div>
          <Lift className={styles.lift()}>
            <table className={styles.table()}>
              <thead>
                <tr>
                  <th></th>
                  <th>Page title</th>
                  <th>Page url</th>
                  <th>Status</th>
                  <th>Last modified date</th>
                  <th>Publication date</th>
                  <th>
                    <label htmlFor="pageviews">Page views</label>
                    <select id="pageviews" className={styles.select()}>
                      <option value="month">Month (last)</option>
                      <option value="year">Year (last)</option>
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => {
                  const today = new Date()
                  const lastModified = parseDayMonthYear(page.lastModified)
                  const publicationDate = parseDayMonthYear(
                    page.publicationDate
                  )
                  const pageViews =
                    page.pageViews ?? randomIntFromInterval(0, 5000)
                  const lastPageViews = randomIntFromInterval(0, 2500)

                  const twoYearsAgo = new Date(today)
                  twoYearsAgo.setFullYear(today.getFullYear() - 2)

                  let hasWarning = false
                  if (page.status !== 'Published' && pageViews < 100)
                    hasWarning = true
                  if (
                    lastModified &&
                    lastModified < twoYearsAgo &&
                    publicationDate &&
                    publicationDate < twoYearsAgo &&
                    pageViews < 100
                  )
                    hasWarning = true

                  return (
                    <tr key={page.url}>
                      <td
                        style={{
                          color: hasWarning ? '#ef5350' : '#66bb6a'
                        }}
                      >
                        {hasWarning ? (
                          <Icon icon={IcRoundWarning} size={20} />
                        ) : (
                          <Icon icon={IcRoundCheck} size={20} />
                        )}
                      </td>
                      <td>{page.title}</td>
                      <td className={styles.url()}>{page.url}</td>
                      <td>{page.status}</td>
                      <td>{page.lastModified}</td>
                      <td>{page.publicationDate}</td>
                      <td>
                        <HStack gap={8} align="center">
                          {lastPageViews > pageViews ? (
                            <Icon icon={IcRoundTrendingDown} />
                          ) : (
                            <Icon icon={IcRoundTrendingUp} />
                          )}
                          {pageViews} <small>({lastPageViews})</small>
                        </HStack>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Lift>
        </Main.Container>
      </Main>
    </>
  )
}
