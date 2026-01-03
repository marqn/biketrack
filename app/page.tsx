// import { BikeMaintenanceApp } from "@/components/bike-maintenance-app"
// import { LoginPage } from "@/components/login-page"

// export default function Page() {
//   return <BikeMaintenanceApp />
// }

'use client'


import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Ładowanie...</div>
  }

  if (!session) {
    return <div>Nie jesteś zalogowany</div>
  }

  return (
    <div>
      <h1>Witaj, {session.user?.name}!</h1>
      <img src={session.user?.image || ''} alt="avatar" />
      <h2>Twój rower</h2>
      <p>Zaraz go dodamy 👌</p>
      <Button onClick={() => signOut()}>Wyloguj się</Button>
    </div>
  )
}