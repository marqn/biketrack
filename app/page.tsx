import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { authOptions } from './api/auth/[...nextauth]/route';


export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login");
  } else {
    console.log('Session data:', session)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bikes: true },
  });

  if (!user?.bike) {
    redirect("/onboarding");
  }

  return (
    <div>
      <h1>Witaj, {session.user?.name}!</h1>
      <img src={session.user?.image || ''} alt="avatar" />
      <h2>Twój rower</h2>
      <p>Zaraz go dodamy 👌</p>
      {/* <Button onClick={() => signOut()}>Wyloguj się</Button> */}
    </div>
  )
}