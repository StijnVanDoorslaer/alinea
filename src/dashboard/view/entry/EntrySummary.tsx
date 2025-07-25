import styler from '@alinea/styler'
import type {SummaryProps} from 'alinea/core/media/Summary'
import {Type} from 'alinea/core/Type'
import {Chip, HStack, px, TextLabel, Typo, VStack} from 'alinea/ui'
import {Ellipsis} from 'alinea/ui/Ellipsis'
import {IcRoundKeyboardArrowRight} from 'alinea/ui/icons/IcRoundKeyboardArrowRight'
import {Fragment, type ReactNode} from 'react'
import {useDashboard} from '../../hook/UseDashboard.js'
import {useNav} from '../../hook/UseNav.js'
import css from './EntrySummary.module.scss'

const styles = styler(css)

export function EntrySummaryRow({
  id,
  title,
  path,
  url,
  type: typeName,
  parents
}: SummaryProps) {
  const nav = useNav()
  const {schema} = useDashboard().config
  const type = schema[typeName]
  if (!type) return null
  return (
    <HStack center full gap={10} className={styles.row()}>
      <VStack>
        {parents.length > 0 && (
          <Ellipsis style={{marginTop: px(-1)}}>
            <Typo.Small>
              <HStack center gap={3} title={url}>
                {parents
                  .map<ReactNode>(({id, title}) => (
                    <Fragment key={id}>{title}</Fragment>
                  ))
                  .reduce((prev, curr, i) => [
                    prev,
                    <IcRoundKeyboardArrowRight key={`s${i}`} />,
                    curr
                  ])}
              </HStack>
            </Typo.Small>
          </Ellipsis>
        )}
        <Ellipsis>
          <TextLabel label={title} title={title} />
        </Ellipsis>
      </VStack>
      <Chip style={{marginLeft: 'auto'}}>
        <TextLabel label={Type.label(type)} title={Type.label(type)} />
      </Chip>
    </HStack>
  )
}

export function EntrySummaryThumb({
  id,
  title,
  type: typeName,
  parents
}: SummaryProps) {
  const {schema} = useDashboard().config
  const type = schema[typeName]!
  return (
    <div className={styles.thumb()}>
      {parents.length > 0 && (
        <header className={styles.thumb.header()}>
          <Typo.Small>
            <HStack center gap={3}>
              {parents
                .map<ReactNode>(({id, title}) => (
                  <Fragment key={id}>{title}</Fragment>
                ))
                .reduce((prev, curr, i) => [
                  prev,
                  <IcRoundKeyboardArrowRight key={`s${i}`} />,
                  curr
                ])}
            </HStack>
          </Typo.Small>
        </header>
      )}
      <div className={styles.thumb.title()}>
        <TextLabel label={title} />
      </div>
      <div className={styles.thumb.footer()}>
        <Chip style={{marginLeft: 'auto'}}>
          <TextLabel label={Type.label(type)} />
        </Chip>
      </div>
    </div>
  )
}
