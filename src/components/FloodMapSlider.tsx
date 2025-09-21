"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FloodLegend from "@/components/FloodLegend";
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
  const [mapReady, setMapReady] = useState(false);

  // Add custom marker styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        background: transparent;
        border: none;
        font-size: 24px;
        text-align: center;
        line-height: 30px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Alignment controls
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayRotation, setOverlayRotation] = useState(0); // degrees
  // Map position
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([43.3668, 5.6349]);
  const [mapZoom, setMapZoom] = useState(14);
  const isUpdatingView = useRef(false);
  // Legend position
  const [legendPosition, setLegendPosition] = useState({ x: 10, y: 10 });
  const [isEditingLegend, setIsEditingLegend] = useState(false);
  const legendDrag = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  // Positioning zone
  const [zoneRect, setZoneRect] = useState({ x: 50, y: 50, w: 300, h: 200 });
  // Markers
  const [markers, setMarkers] = useState([
    { id: 'pont-banne', name: 'Pont de la Banne', emoji: '🌉', desc: 'Le pont peut être submergé lors d\'une crue importante. Risque d\'interruption de circulation et d\'accès aux services.', lat: 43.36685, lng: 5.6348 },
    { id: 'college', name: 'Collège Ubelka', emoji: '🏫', desc: 'Nombreux élèves, suivre le Plan Particulier de Mise en Sûreté (PPMS) précisant les zones de refuge situées en étage ou hors d\'atteinte de la montée des eaux.', lat: 43.3619, lng: 5.6359 },
    { id: 'quartier-riverain', name: 'Quartier riverain', emoji: '🏠', desc: 'Habitat individuel proche du lit. Prévoir information des riverains, surélévation des équipements et itinéraires d\'évacuation.', lat: 43.366, lng: 5.635 },
    { id: 'zone-agricole', name: 'Zone agricole', emoji: '🚜', desc: 'Impacts économiques possibles.', lat: 43.365, lng: 5.635 },
  ]);
  const [isEditingMarkers, setIsEditingMarkers] = useState(false);
  const [isEditingMap, setIsEditingMap] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);

  // Load saved alignment settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('floodMapAlignment');
    if (saved) {
      try {
        const { offset, scale, rotation, center, zoom, legendPos, zone, markers: savedMarkers } = JSON.parse(saved);
        setOverlayOffset(offset || { x: 0, y: 0 });
        setOverlayScale(scale || 1);
        setOverlayRotation(rotation || 0);
        setMapCenter(center || [43.3668, 5.6349]);
        setMapZoom(zoom || 14);
        setLegendPosition(legendPos || { x: 10, y: 10 });
        setZoneRect(zone || { x: 50, y: 50, w: 200, h: 100 });
        setMarkers(savedMarkers || markers);
      } catch (e) {
        console.warn('Failed to load saved alignment settings:', e);
      }
    }
  }, []);

  // Auto-save alignment settings to localStorage whenever they change
  useEffect(() => {
    const centerArray = Array.isArray(mapCenter) ? mapCenter : [mapCenter.lat, mapCenter.lng];
    const settings = {
      offset: overlayOffset,
      scale: overlayScale,
      rotation: overlayRotation,
      center: centerArray,
      zoom: mapZoom,
      legendPos: legendPosition,
      zone: zoneRect,
      markers,
    };
    localStorage.setItem('floodMapAlignment', JSON.stringify(settings));
  }, [overlayOffset, overlayScale, overlayRotation, mapCenter, mapZoom, legendPosition, zoneRect]);

  // Save markers separately
  useEffect(() => {
    const saved = localStorage.getItem('floodMapAlignment');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.markers = markers;
      localStorage.setItem('floodMapAlignment', JSON.stringify(parsed));
    }
  }, [markers]);

  // Save alignment settings to localStorage
  const saveAlignment = () => {
    const map = mapInstance.current;
    const currentCenter = map ? map.getCenter() : mapCenter;
    const currentZoom = map ? map.getZoom() : mapZoom;
    const centerArray = Array.isArray(currentCenter) ? currentCenter : [currentCenter.lat, currentCenter.lng];
    const settings = {
      offset: overlayOffset,
      scale: overlayScale,
      rotation: overlayRotation,
      center: centerArray,
      zoom: currentZoom,
    };
    localStorage.setItem('floodMapAlignment', JSON.stringify(settings));
    alert('Paramètres d\'alignement sauvegardés !');
  };

  // Load alignment settings from localStorage
  const loadAlignment = () => {
    const saved = localStorage.getItem('floodMapAlignment');
    if (saved) {
      try {
        const { offset, scale, rotation } = JSON.parse(saved);
        setOverlayOffset(offset || { x: 0, y: 0 });
        setOverlayScale(scale || 1);
        setOverlayRotation(rotation || 0);
      } catch (e) {
        alert('Erreur lors du chargement des paramètres sauvegardés.');
      }
    } else {
      alert('Aucun paramètre sauvegardé trouvé.');
    }
  };
  const overlayDrag = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

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

  // Drag legend position
  useEffect(() => {
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!legendDrag.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const dx = clientX - legendDrag.current.startX;
      const dy = clientY - legendDrag.current.startY;
      setLegendPosition({ x: legendDrag.current.origX + dx, y: legendDrag.current.origY + dy });
    };
    const onPointerUp = () => {
      legendDrag.current = null;
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
    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      touchZoom: false,
      zoomSnap: 0.5,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapInstance.current = map;
    setMapReady(true);

    // Add markers
    markers.forEach((markerData, index) => {
      const icon = L.divIcon({
        html: markerData.emoji,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon,
        draggable: isEditingMarkers,
      }).addTo(map).bindPopup(`<b>${markerData.name}</b><br>${markerData.desc}`);
      marker.on('dragend', () => {
        const newPos = marker.getLatLng();
        setMarkers(prev => prev.map((m, i) => i === index ? { ...m, lat: newPos.lat, lng: newPos.lng } : m));
      });
      markersRef.current[index] = marker;
    });

    // Update state on map move/zoom
    const updatePosition = () => {
      if (isUpdatingView.current) return;
      setMapCenter(map.getCenter());
      setMapZoom(map.getZoom());
    };
    map.on('moveend', updatePosition);
    map.on('zoomend', updatePosition);

    // Ensure Leaflet resizes correctly when container size changes
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.off('moveend', updatePosition);
      map.off('zoomend', updatePosition);
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update map view when center or zoom changes
  useEffect(() => {
    const map = mapInstance.current;
    if (map) {
      isUpdatingView.current = true;
      map.setView(mapCenter, mapZoom);
      isUpdatingView.current = false;
    }
  }, [mapCenter, mapZoom]);

  // Update marker positions when markers state changes
  useEffect(() => {
    markersRef.current.forEach((marker, index) => {
      if (marker && markers[index]) {
        marker.setLatLng([markers[index].lat, markers[index].lng]);
      }
    });
  }, [markers]);

  // Update marker draggable when editing mode changes
  useEffect(() => {
    markersRef.current.forEach(marker => {
      if (marker && marker.dragging) {
        if (isEditingMarkers) {
          marker.dragging.enable();
        } else {
          marker.dragging.disable();
        }
      }
    });
  }, [isEditingMarkers]);

  // Update map interactions when editing mode changes
  useEffect(() => {
    const map = mapInstance.current;
    if (map) {
      if (isEditingMap) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();
        if (map.zoomControl) map.zoomControl.addTo(map);
      } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();
        if (map.zoomControl) map.zoomControl.remove();
      }
    }
  }, [isEditingMap]);





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


      {/* Quick buttons */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setRatio(1)}>Aléas</Button>
        <Button size="sm" variant="secondary" onClick={() => setRatio(0)}>Plan</Button>
        <Button size="sm" onClick={() => setRatio(0.5)}>50/50</Button>
        <Button size="sm" variant={isEditingMarkers ? "default" : "outline"} onClick={() => setIsEditingMarkers(!isEditingMarkers)}>
          {isEditingMarkers ? "Fin Marqueurs" : "Éditer Marqueurs"}
        </Button>
        <Button size="sm" variant={isEditingMap ? "default" : "outline"} onClick={() => setIsEditingMap(!isEditingMap)}>
          {isEditingMap ? "Verrouiller Carte" : "Éditer Carte"}
        </Button>
      </div>

      {/* Legend overlay */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${zoneRect.x}px`,
          top: `${zoneRect.y}px`,
          width: `${zoneRect.w}px`,
          height: `${zoneRect.h}px`,
          clipPath: `inset(0 ${Math.max(0, (1 - ratio) * 100)}% 0 0)`,
        }}
      >
        <FloodLegend />
      </div>
    </div>
  );
}


export default FloodMapSlider;