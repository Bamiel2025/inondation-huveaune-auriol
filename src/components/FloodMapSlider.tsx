"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Simple before/after image slider with draggable handle and optional clickable zones overlay
// Props
// - hazardImage: URL string for flood hazard map
// - planImage: URL string for city plan/basemap
// - zones: array of clickable rectangles with info
export type FloodZone = {
  id: string;
  title: string;
  description: string;
  // rect as percentages relative to container
  x: number; // 0-100
  y: number; // 0-100
  w: number; // 0-100
  h: number; // 0-100
  riskLevel: "fort" | "moyen" | "faible" | "résiduel";
};

interface Props {
  hazardImage: string;
  planImage: string;
  zones?: FloodZone[];
  className?: string;
}

export function FloodMapSlider({ hazardImage, planImage, zones = [], className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [ratio, setRatio] = useState(0.6); // portion showing hazard image
  const dragging = useRef(false);
  // Alignment controls
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayRotation, setOverlayRotation] = useState(0); // degrees
  const overlayDrag = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  // Reference landmarks layer toggle
  const [showRefs, setShowRefs] = useState(true);
  const refsLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setRatio(r);
    };
    const stop = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  // Drag hazard overlay while holding Shift to fine-tune alignment
  useEffect(() => {
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!overlayDrag.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const dx = clientX - overlayDrag.current.startX;
      const dy = clientY - overlayDrag.current.startY;
      setOverlayOffset({ x: overlayDrag.current.origX + dx, y: overlayDrag.current.origY + dy });
    };
    const onPointerUp = () => {
      overlayDrag.current = null;
    };
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  // Initialize Leaflet map centered on Auriol (Bouches-du-Rhône, France)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    // Auriol approx coordinates
    const auriol: L.LatLngExpression = [43.3668, 5.6349];
    const map = L.map(mapRef.current, {
      center: auriol,
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapInstance.current = map;

    // Ensure Leaflet resizes correctly when container size changes
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Create/Toggle reference landmarks (bridges, collège, Huveaune trace)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear previous layer
    if (refsLayerRef.current) {
      refsLayerRef.current.removeFrom(map);
      refsLayerRef.current = null;
    }

    if (!showRefs) return;

    const refs = L.layerGroup();
    const refStyle: L.PathOptions = { color: "#2563eb", opacity: 0.9, weight: 2, fillOpacity: 0.25 };

    // Pont du centre (approx)
    L.circleMarker([43.36685, 5.6348], { radius: 6, ...refStyle }).addTo(refs).bindTooltip("Pont du centre");
    // Pont en amont (approx)
    L.circleMarker([43.3692, 5.6329], { radius: 6, ...refStyle }).addTo(refs).bindTooltip("Pont amont");
    // Collège (approx)
    L.circleMarker([43.3619, 5.6359], { radius: 6, ...refStyle }).addTo(refs).bindTooltip("Collège");
    // Mairie (approx)
    L.circleMarker([43.3672, 5.6357], { radius: 6, ...refStyle }).addTo(refs).bindTooltip("Mairie");

    // Tracé simplifié de l'Huveaune à travers Auriol (approx points)
    const huveauneCoords: L.LatLngExpression[] = [
      [43.3712, 5.6308],
      [43.3702, 5.6318],
      [43.3694, 5.6326],
      [43.3686, 5.6333],
      [43.3677, 5.6342],
      [43.3669, 5.6350],
      [43.3662, 5.6357],
      [43.3653, 5.6365],
      [43.3643, 5.6373],
      [43.3635, 5.6380],
    ];
    L.polyline(huveauneCoords, { color: "#0ea5e9", weight: 3, opacity: 0.9 }).addTo(refs).bindTooltip("Huveaune");

    refs.addTo(map);
    refsLayerRef.current = refs;
  }, [showRefs]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border", className)} ref={containerRef}>
      {/* Basemap (Leaflet map of Auriol) */}
      <div ref={mapRef} className="absolute inset-0 [contain:layout_paint]" aria-label="Plan interactif d'Auriol (Leaflet)" />

      {/* Hazard overlay with slider clip */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${Math.max(0, (1 - ratio) * 100)}% 0 0)`,
          opacity: overlayOpacity,
          transform: `translate(${overlayOffset.x}px, ${overlayOffset.y}px) scale(${overlayScale}) rotate(${overlayRotation}deg)`,
          transformOrigin: "top left",
          willChange: "transform, opacity",
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => {
          if (!e.shiftKey) return;
          overlayDrag.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: overlayOffset.x,
            origY: overlayOffset.y,
          };
        }}
        onTouchStart={(e) => {
          // On touch, always allow drag (mobile has no Shift)
          const t = e.touches[0];
          overlayDrag.current = {
            startX: t.clientX,
            startY: t.clientY,
            origX: overlayOffset.x,
            origY: overlayOffset.y,
          };
        }}
      >
        <img src={hazardImage} alt="Carte des aléas inondation" className="block w-full h-full object-cover select-none" draggable={false} />
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 -translate-x-1/2 cursor-ew-resize"
        style={{ left: `${ratio * 100}%` }}
        onMouseDown={() => (dragging.current = true)}
        onTouchStart={() => (dragging.current = true)}
        aria-label="Glisser pour comparer"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
      >
        <div className="h-full w-1 bg-primary/80 shadow-[0_0_0_2px_rgba(0,0,0,0.2)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground border rounded-full px-2 py-1 text-xs">Aléas ↔ Plan</div>
      </div>

      {/* Clickable zones */}
      <TooltipProvider>
        {zones.map((z) => (
          <Zone key={z.id} zone={z} />
        ))}
      </TooltipProvider>

      {/* Quick buttons */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setRatio(1)}>Aléas</Button>
        <Button size="sm" variant="secondary" onClick={() => setRatio(0)}>Plan</Button>
        <Button size="sm" onClick={() => setRatio(0.5)}>50/50</Button>
      </div>

      {/* Alignment controls for precise superposition */}
      <div className="absolute bottom-3 left-3 grid gap-1 bg-background/80 backdrop-blur border rounded-md p-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Opacité</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat((e.target as HTMLInputElement).value))}
            className="w-32"
          />
          <span>{Math.round(overlayOpacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Décalage</span>
          <div className="grid grid-cols-4 gap-1">
            <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setOverlayOffset((o) => ({ ...o, y: o.y - 5 }))}>↑</Button>
            <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setOverlayOffset((o) => ({ ...o, y: o.y + 5 }))}>↓</Button>
            <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setOverlayOffset((o) => ({ ...o, x: o.x - 5 }))}>←</Button>
            <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setOverlayOffset((o) => ({ ...o, x: o.x + 5 }))}>→</Button>
          </div>
          <span className="text-muted-foreground">Maintenir Maj pour déplacer à la souris</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Échelle</span>
          <Button size="sm" variant="secondary" onClick={() => setOverlayScale((s) => +(Math.max(0.5, s - 0.01)).toFixed(3))}>-</Button>
          <span className="w-10 text-center">{Math.round(overlayScale * 100)}%</span>
          <Button size="sm" variant="secondary" onClick={() => setOverlayScale((s) => +(Math.min(2, s + 0.01)).toFixed(3))}>+</Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Rotation</span>
          <Button size="sm" variant="secondary" onClick={() => setOverlayRotation((r) => +(r - 0.5).toFixed(1))}>-</Button>
          <span className="w-10 text-center">{overlayRotation.toFixed(1)}°</span>
          <Button size="sm" variant="secondary" onClick={() => setOverlayRotation((r) => +(r + 0.5).toFixed(1))}>+</Button>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 select-none">
            <input type="checkbox" checked={showRefs} onChange={(e) => setShowRefs(e.target.checked)} />
            <span>Repères (ponts, collège, Huveaune)</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setOverlayOpacity(0.8); setOverlayOffset({ x: 0, y: 0 }); setOverlayScale(1); setOverlayRotation(0); }}>Réinitialiser</Button>
        </div>
      </div>
    </div>
  );
}

function Zone({ zone }: { zone: FloodZone }) {
  const colors: Record<FloodZone["riskLevel"], string> = {
    fort: "bg-red-500/30 border-red-500",
    moyen: "bg-orange-500/30 border-orange-500",
    faible: "bg-yellow-400/30 border-yellow-400",
    résiduel: "bg-green-500/30 border-green-500",
  };
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className={cn(
                "absolute border backdrop-blur-[2px] transition-colors hover:bg-black/10",
                colors[zone.riskLevel]
              )}
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
              aria-label={`Zone ${zone.title}`}
            />
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{zone.title}</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{zone.title}</DialogTitle>
          <DialogDescription>
            Niveau d'aléa: <strong className="capitalize">{zone.riskLevel}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm leading-relaxed space-y-2">
          <p>{zone.description}</p>
          <p className="text-muted-foreground">Consigne: Identifiez les bâtiments et infrastructures en jeu et proposez des mesures de prévention adaptées.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FloodMapSlider;