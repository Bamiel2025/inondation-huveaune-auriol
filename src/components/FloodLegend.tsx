"use client";

import { Badge } from "@/components/ui/badge";

export default function FloodLegend() {
  return (
    <div className="rounded-lg border bg-card p-2 text-xs space-y-2 overflow-hidden">
      <h3 className="font-semibold text-xs">Légende</h3>
      <div className="grid grid-cols-1 gap-2">
        <LegendItem color="bg-red-500" label="Aléa fort" desc="Vitesse et hauteurs importantes: zone d'inondation majeure (crue de référence)." />
        <LegendItem color="bg-orange-500" label="Aléa moyen" desc="Vitesses/hauteurs modérées: débordement fréquent de l'Huveaune." />
        <LegendItem color="bg-yellow-400" label="Aléa faible" desc="Inondations faibles: nappage rapide, ruissellement local." />
        <LegendItem color="bg-green-500" label="Aléa résiduel" desc="Risque limité: zones périphériques, vigilance requise." />
        <LegendItem color="bg-purple-500" label="Enveloppe crue exceptionnelle" desc="Zone inondable lors de crues extrêmes dépassant la crue de référence." />
      </div>
    </div>
  );
}

function LegendItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 h-3 w-3 rounded-sm border ${color}`} />
      <div>
        <div className="font-medium leading-tight text-xs">{label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{desc}</div>
      </div>
    </div>
  );
}