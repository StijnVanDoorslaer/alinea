import styler from '@alinea/styler'
import {IconButton} from 'alinea/dashboard/view/IconButton'
import {Button} from 'alinea/ui/Button'
import {Icon} from 'alinea/ui/Icon'
import {IcRoundAdd} from 'alinea/ui/icons/IcRoundAdd'
import {IcRoundDelete} from 'alinea/ui/icons/IcRoundDelete'
import {IcRoundEdit} from 'alinea/ui/icons/IcRoundEdit'
import {IcRoundOpenInNew} from 'alinea/ui/icons/IcRoundOpenInNew'
import {IcRoundTrendingDown} from 'alinea/ui/icons/IcRoundTrendingDown'
import {IcRoundTrendingUp} from 'alinea/ui/icons/IcRoundTrendingUp'
import {HStack} from 'alinea/ui/Stack'
import css from './SeoField.module.scss'

const styles = styler(css)

const paths = [
  {url: '/campaign', type: 'current', pageviews: 4321, pageviews_last: 1234},
  {
    url: '/campaign-old',
    type: 'old',
    pageviews: 750,
    pageviews_last: 1234
  },
  {
    url: '/campaign-2026',
    type: 'vanity',
    pageviews: 3210,
    pageviews_last: 1234
  }
]

export const SeoField = () => {
  return (
    <div className={styles.seo()}>
      <div className={styles.seo.header()}>
        <h2>URL Aliases</h2>
        <div className={styles.seo.header.end()}>
          <div className={styles.seo.header.pageviews()}>
            Pageviews
            <select>
              <option value="month">Month (last)</option>
              <option value="year">Year (last)</option>
            </select>
          </div>
          <p className={styles.seo.header.actions()}>Actions</p>
        </div>
      </div>
      <div className={styles.seo.list()}>
        {paths.map(path => (
          <div key={path.url} className={styles.seo.list.item(path.type)}>
            <div className={styles.seo.list.item.url()}>
              <Icon icon={IcRoundOpenInNew} />
              {path.url}
            </div>
            <div className={styles.seo.list.item.status()}>{path.type}</div>
            <div className={styles.seo.list.item.end()}>
              <div
                className={styles.seo.list.item.pageviews({
                  positive: path.pageviews > path.pageviews_last
                })}
              >
                <HStack gap={8} align="center">
                  {path.pageviews_last > path.pageviews ? (
                    <Icon icon={IcRoundTrendingDown} />
                  ) : (
                    <Icon icon={IcRoundTrendingUp} />
                  )}
                  {path.pageviews} <small>({path.pageviews_last})</small>
                </HStack>
              </div>
              <div className={styles.seo.list.item.actions()}>
                {path.type === 'vanity' && <IconButton icon={IcRoundEdit} />}
                {path.type !== 'current' && <IconButton icon={IcRoundDelete} />}
              </div>
            </div>
          </div>
        ))}
        <div className={styles.seo.list.item('total')}>
          <div className={styles.seo.list.item.url()}>Total pageviews</div>
          <div className={styles.seo.list.item.end()}>
            <div
              className={styles.seo.list.item.pageviews({
                positive: true
              })}
            >
              <HStack gap={8} align="center">
                <Icon icon={IcRoundTrendingUp} />
                8281 <small>(3702)</small>
              </HStack>
            </div>
            <div className={styles.seo.list.item.actions()}></div>
          </div>
        </div>
      </div>
      <Button icon={IcRoundAdd} className={styles.seo.button()}>
        Add url path
      </Button>
    </div>
  )
}
