import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/jogos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/jogos/"!</div>
}
