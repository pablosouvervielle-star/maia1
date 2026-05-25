import { Stethoscope } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">MAIA</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Clinical Intelligence
            <br />
            for Modern Dentistry
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-md">
            AI-powered differential diagnosis, complete clinical records, and research analytics
            — all in one minimalist platform.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            {[
              'Claude claude-opus-4-6 AI for dental diagnosis',
              'Multimodal X-ray and image analysis',
              'Interactive FDI odontogram',
              'Research-grade analytics dashboard',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/40">
          For licensed dental professionals only. Clinical decision support — not a substitute for
          professional judgment.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
