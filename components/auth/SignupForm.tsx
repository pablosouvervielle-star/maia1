'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('¡Cuenta creada! Revisa tu correo para verificar tu cuenta.')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nombre Completo
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Dr. Ana García"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="rounded-xl h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Correo Electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="dr.garcia@clinica.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-xl h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-xl h-11"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 rounded-xl font-bold"
        disabled={loading}
        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear Cuenta
      </Button>
    </form>
  )
}
