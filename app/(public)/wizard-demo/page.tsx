// Demo component can be rendered here

export const metadata = {
  title: "Wizard Demo | Finance Tracker",
  description: "Exemplo demonstrativo do Wizard declarativo baseado no DataForm",
}

export default function WizardDemoPage() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Demonstração do Wizard Declarativo
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Formulário multi-etapas com validação por schema Zod, passos condicionais, persistência de rascunho e suporte a Sheet.
        </p>
      </div>

      <div className="p-4 border rounded-lg text-center text-muted-foreground text-sm">Demo em atualização</div>
    </div>
  )
}
