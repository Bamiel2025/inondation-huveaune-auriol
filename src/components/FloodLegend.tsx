"use client";

import { Badge } from "@/components/ui/badge";

export default function FloodLegend() {
  return (
    <div className="rounded-lg border bg-card p-4 text-sm space-y-3">
      <h3 className="font-semibold">Légende</h3>
      <div className="grid grid-cols-2 gap-3">
        <LegendItem color="bg-red-500" label="Aléa fort" desc="Vitesse et hauteurs importantes: zone d'inondation majeure (crue de référence)." />
        <LegendItem color="bg-orange-500" label="Aléa moyen" desc="Vitesses/hauteurs modérées: débordement fréquent de l'Huveaune." />
        <LegendItem color="bg-yellow-400" label="Aléa faible" desc="Inondations faibles: nappage rapide, ruissellement local." />
        <LegendItem color="bg-green-500" label="Aléa résiduel" desc="Risque limité: zones périphériques, vigilance requise." />
      </div>
      <div className="space-y-2">
        <h4 className="font-medium">Enjeux (exemples)</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Bâtiments d'habitation et écoles <Badge variant="secondary">population</Badge></li>
          <li>Commerces et ateliers <Badge variant="secondary">économie</Badge></li>
          <li>Ouvrages: ponts, voies, réseaux <Badge variant="secondary">infrastructures</Badge></li>
        </ul>
      </div>
      <div>
        <h4 className="font-medium">Lire la carte</h4>
        <p>Glissez le curseur pour comparer le <strong>plan d'Auriol</strong> et la <strong>carte des aléas</strong>. Cliquez sur une zone colorée pour des informations détaillées.</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 h-4 w-4 rounded-sm border ${color}`} />
      <div>
        <div className="font-medium leading-none">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}