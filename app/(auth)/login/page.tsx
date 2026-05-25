import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inicia sesión en tu cuenta MAIA
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
