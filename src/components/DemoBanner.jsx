export default function DemoBanner() {
  return (
    <p className="rounded-lg border border-accent-400/25 bg-accent-400/[0.06] px-4 py-2 text-center text-xs text-accent-400">
      Mode démo : données fictives. Ajoute <code className="font-mono">COC_API_TOKEN</code> côté
      serveur pour charger de vraies données.
    </p>
  );
}
