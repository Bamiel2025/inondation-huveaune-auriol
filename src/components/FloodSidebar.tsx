"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            <p>
              Identifiez les enjeux dans chaque zone et discutez des conséquences d'une crue: évacuation, coupure de voies, dommages aux bâtiments.
            </p>
          </TabsContent>
          <TabsContent value="risque" className="mt-0 space-y-2">
            <p>
              Le risque = <strong>Aléa × Enjeux</strong>. Une zone à aléa faible peut présenter un risque élevé si les enjeux sont importants (ex: école, hôpital).
            </p>
            <p>
              Proposez des mesures: information préventive, entretien du lit, aménagements, culture du risque, plans d'évacuation.
            </p>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}