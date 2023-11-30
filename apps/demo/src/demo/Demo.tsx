'use client'

import {cms} from '@/cms'
import {Handler} from 'alinea/backend'
import 'alinea/css'
import {App} from 'alinea/dashboard/App'
import {Modal} from 'alinea/dashboard/view/Modal'
import {Viewport} from 'alinea/dashboard/view/Viewport'
import {Button, HStack, Loader, Typo} from 'alinea/ui'
import {Suspense, use, useState} from 'react'

const connection = cms.connection()

const handler = new Handler({
  config: cms
  // ...
})

export default function Demo() {
  const [reminderOpen, setReminderOpen] = useState(true)
  const client = use(connection)
  return (
    <>
      <style>{`#__next {height: 100%}`}</style>
      <Viewport attachToBody color="#5661E5" contain>
        <Modal open={reminderOpen} onClose={() => setReminderOpen(false)}>
          <Typo.H1>Demo</Typo.H1>
          <Typo.P>
            This is a demo showcasing the{' '}
            <Typo.Link href="https://alinea.sh">Alinea CMS</Typo.Link>{' '}
            dashboard. It is not connected to a server, any changes you make are
            persisted locally.
          </Typo.P>
          <HStack>
            <Button size="large" onClick={() => setReminderOpen(false)}>
              Let&apos;s see it
            </Button>
          </HStack>
        </Modal>
        <Suspense fallback={<Loader absolute />}>
          <App dev config={cms} client={client} />
        </Suspense>
      </Viewport>
    </>
  )
}
