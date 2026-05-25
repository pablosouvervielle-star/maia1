import { Stethoscope, Brain, Activity, Shield } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.3)' }}>
            <Stethoscope className="h-6 w-6 text-indigo-300" />
          </div>
          <span className="text-3xl font-black tracking-widest text-white">MAIA</span>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Inteligencia
              <br />
              <span className="text-indigo-400">Clínica</span>
              <br />
              Dental
            </h2>
            <p className="text-lg text-indigo-200/70 max-w-md">
              Diagnóstico diferencial con IA, historial clínico completo y analítica de investigación — todo en una sola plataforma.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Brain, text: 'IA Claude claude-opus-4-6 para diagnóstico dental' },
              { icon: Activity, text: 'Análisis multimodal de radiografías' },
              { icon: Stethoscope, text: 'Odontograma FDI interactivo' },
              { icon: Shield, text: 'Dashboard de investigación clínica' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)' }}>
                <Icon className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <span className="text-xs text-indigo-100/80 leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-indigo-300/40">
          Solo para profesionales odontológicos certificados. Apoyo a la decisión clínica — no sustituye el criterio profesional.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
