"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function FloodSidebar() {
  return (
    <div className="h-full rounded-lg border bg-card">
      <Tabs defaultValue="alea" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="alea">Aléa</TabsTrigger>
          <TabsTrigger value="enjeux">Enjeux</TabsTrigger>
          <TabsTrigger value="risque">Risque</TabsTrigger>
        </TabsList>
        <ScrollArea className="p-4 h-[calc(100%-2.5rem)]">
          <TabsContent value="alea" className="mt-0 space-y-2">
            <p>
              L'aléa correspond à l'<strong>intensité potentielle</strong> de la crue de l'Huveaune: hauteur d'eau et vitesse d'écoulement. Sur la carte, plus la couleur est chaude, plus l'aléa est fort.
            </p>
            <p>
              La carte d'aléas provient du PPRI et représente une <em>crue de référence</em>. Comparez-la au plan pour localiser les secteurs exposés à Auriol.
            </p>
          </TabsContent>
          <TabsContent value="enjeux" className="mt-0 space-y-2">
            <p>
              Les enjeux regroupent les <strong>personnes, biens et services</strong> susceptibles d'être affectés: habitations, écoles, commerces, routes, ponts, réseaux.
            </p>
            <h4 className="font-medium">Enjeux (exemples)</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bâtiments d'habitation et écoles <Badge variant="secondary">population</Badge></li>
              <li>Commerces et ateliers <Badge variant="secondary">économie</Badge></li>
              <li>Ouvrages: ponts, voies, réseaux <Badge variant="secondary">infrastructures</Badge></li>
            </ul>
          </TabsContent>
          <TabsContent value="risque" className="mt-0 space-y-4">
            <div>
              <h4 className="font-semibold">Évaluer le Risque</h4>
              <p className="text-lg font-mono bg-muted p-2 rounded">
                RISQUE = ALÉA × ENJEUX × VULNÉRABILITÉ
              </p>
              <p className="text-sm text-muted-foreground">Formule de base pour l'évaluation du risque</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Matrice des Risques</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-1 bg-gray-100">Aléa / Enjeux</th>
                      <th className="border border-gray-300 p-1 bg-gray-100">Faible</th>
                      <th className="border border-gray-300 p-1 bg-gray-100">Moyen</th>
                      <th className="border border-gray-300 p-1 bg-gray-100">Fort</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-1 bg-gray-100 font-medium">Faible</td>
                      <td className="border border-gray-300 p-1 text-center bg-yellow-200">Très faible</td>
                      <td className="border border-gray-300 p-1 text-center bg-yellow-200">Faible</td>
                      <td className="border border-gray-300 p-1 text-center bg-orange-200">Moyen</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-1 bg-gray-100 font-medium">Moyen</td>
                      <td className="border border-gray-300 p-1 text-center bg-yellow-200">Faible</td>
                      <td className="border border-gray-300 p-1 text-center bg-orange-200">Moyen</td>
                      <td className="border border-gray-300 p-1 text-center bg-red-200">Fort</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-1 bg-gray-100 font-medium">Fort</td>
                      <td className="border border-gray-300 p-1 text-center bg-orange-200">Moyen</td>
                      <td className="border border-gray-300 p-1 text-center bg-red-200">Fort</td>
                      <td className="border border-gray-300 p-1 text-center bg-red-300">Très fort</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Actions de Prévention</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded"></span>
                  <span className="text-sm"><strong>Risque Faible:</strong> Information, surveillance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-400 rounded"></span>
                  <span className="text-sm"><strong>Risque Moyen:</strong> Mesures de protection, planification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-400 rounded"></span>
                  <span className="text-sm"><strong>Risque Fort:</strong> Restrictions d'usage, protection renforcée</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600 rounded"></span>
                  <span className="text-sm"><strong>Risque Très Fort:</strong> Interdiction, évacuation</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}