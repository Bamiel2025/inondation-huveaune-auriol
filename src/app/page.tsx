"use client";

import FloodMapSlider, { FloodZone } from "@/components/FloodMapSlider";
import FloodLegend from "@/components/FloodLegend";
import FloodSidebar from "@/components/FloodSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const HAZARD_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/ppri%20auriol-1758388182761.png";

// OpenStreetMap static map centered on Auriol (approx.)
const PLAN_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ba1100f6-aa8b-475a-8126-0b094618ca93/generated_images/a-detailed-city-plan-map-of-auriol%2c-fr-e6b22a5b-20250920171753.jpg?";

const ZONES: FloodZone[] = [
  {
    id: "pont-centre",
    title: "Pont du centre-ville",
    description:
      "Le pont peut être submergé lors d'une crue importante. Risque d'interruption de circulation et d'accès aux services.",
    x: 47,
    y: 52,
    w: 10,
    h: 10,
    riskLevel: "fort",
  },
  {
    id: "quartier-sud",
    title: "Quartier riverain (sud)",
    description:
      "Habitat individuel proche du lit. Prévoir information des riverains, surélévation des équipements et itinéraires d'évacuation.",
    x: 60,
    y: 62,
    w: 16,
    h: 12,
    riskLevel: "moyen",
  },
  {
    id: "zone-activite",
    title: "Zone d'activités",
    description:
      "Commerces et ateliers exposés aux débordements. Impacts économiques possibles, sécuriser les stocks et produits.",
    x: 30,
    y: 58,
    w: 15,
    h: 10,
    riskLevel: "faible",
  },
  {
    id: "berges-vegetalisees",
    title: "Berges végétalisées",
    description:
      "Secteur à aléa résiduel: rôle tampon en cas de crue, entretien écologique des berges recommandé.",
    x: 75,
    y: 45,
    w: 12,
    h: 8,
    riskLevel: "résiduel",
  },
];

export default function Page() {
  return (
    <div className="min-h-dvh p-4 sm:p-6 lg:p-8 space-y-4">
      <header className="max-w-6xl mx-auto w-full">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Auriol — Comprendre le risque d'inondation de l'Huveaune</CardTitle>
              <p className="text-sm text-muted-foreground">
                Glissez le curseur pour comparer le plan et la carte des aléas. Cliquez sur les zones pour découvrir les enjeux.
              </p>
            </div>
            <div className="flex gap-2">
              <a href="#activite" className="contents">
                <Button variant="secondary">Activité guidée</Button>
              </a>
              <a href="#carte" className="contents">
                <Button>Aller à la carte</Button>
              </a>
            </div>
          </CardHeader>
        </Card>
      </header>

      <main id="carte" className="grid max-w-6xl mx-auto w-full gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <FloodMapSlider hazardImage={HAZARD_URL} planImage={PLAN_URL} zones={ZONES} className="aspect-[3/2] w-full" />
          <FloodLegend />
        </section>
        <aside className="min-h-[420px]">
          <FloodSidebar />
        </aside>
      </main>

      <section id="activite" className="max-w-6xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Activité pour les élèves</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Repérez sur le <strong>plan</strong> les quartiers et ouvrages principaux (ponts, routes, équipements).</li>
              <li>Faites glisser le <strong>curseur</strong> pour afficher la <strong>carte des aléas</strong> et comparez.</li>
              <li>Cliquez sur les <strong>zones</strong> colorées et notez le niveau d'aléa et les <strong>enjeux</strong> présents.</li>
              <li>Évaluez le <strong>risque</strong> (Aléa × Enjeux) pour 2 secteurs et proposez des mesures de prévention.</li>
            </ol>
            <Separator className="my-2" />
            <p className="text-muted-foreground">
              Sources: Carte d'aléas du PPRI — Auriol. Cette application a pour objectif pédagogique d'aider à comprendre la notion de risque d'inondation.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}