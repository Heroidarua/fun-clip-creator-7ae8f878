import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/mercadopago-webhook')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/public/mercadopago-webhook"!</div>
}
