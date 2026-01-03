"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Bike } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("test@wp.pl")
  const [password, setPassword] = useState("lalala")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">BikeTrack</CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać serwisem swoich rowerów</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Zaloguj się
            </Button>
            
            <Button className="w-full">
              Zaloguj przez Google
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-4">Demo: użyj dowolnego emaila i hasła</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
