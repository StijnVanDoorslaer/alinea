import styler from '@alinea/styler'
import {TextLabel, Typo} from 'alinea/ui'
import {Lift} from 'alinea/ui/Lift'
import {Main} from 'alinea/ui/Main'
import Head from 'next/head.js'
import css from './RotRoot.module.css'

const styles = styler(css)

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
    status: 'Pusblished',
    lastModified: '31/01/2026',
    publicationDate: '01/01/2026',
    pageViews: 4321
  },
  {
    title: 'Test',
    url: '/en/test',
    status: 'Pusblished',
    lastModified: '31/01/2020',
    publicationDate: '01/01/2020',
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
                  <th>Page views/year</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => {
                  const today = new Date()
                  const lastModified = parseDayMonthYear(page.lastModified)
                  const publicationDate = parseDayMonthYear(
                    page.publicationDate
                  )

                  const twoYearsAgo = new Date(today)
                  twoYearsAgo.setFullYear(today.getFullYear() - 2)
                  const fiveYearsAgo = new Date(today)
                  fiveYearsAgo.setFullYear(today.getFullYear() - 5)

                  const hasWarning =
                    lastModified !== null &&
                    publicationDate !== null &&
                    lastModified < twoYearsAgo &&
                    publicationDate < fiveYearsAgo &&
                    page.pageViews < 100

                  return (
                    <tr key={page.url}>
                      <td
                        style={{
                          color: hasWarning ? '#ef5350' : '#66bb6a'
                        }}
                      >
                        •
                      </td>
                      <td>{page.title}</td>
                      <td>{page.url}</td>
                      <td>{page.status}</td>
                      <td>{page.lastModified}</td>
                      <td>{page.publicationDate}</td>
                      <td>{page.pageViews}</td>
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
