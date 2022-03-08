import {fromModule, Viewport} from '@alinea/ui'
import {PropsWithChildren} from 'react'
import {Footer} from './Footer'
import {Header} from './Header'
import css from './Layout.module.scss'
import {LayoutProps} from './Layout.query'

const styles = fromModule(css)

export function Layout({children, header}: PropsWithChildren<LayoutProps>) {
  return (
    <Viewport color="#FB934F" className={styles.root()}>
      <Header {...header} />
      <div className={styles.root.content()}>{children}</div>
      <Footer />
    </Viewport>
  )
}
