import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Crear tu cuenta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Únete a MAIA — exclusivo para profesionales odontológicos
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
