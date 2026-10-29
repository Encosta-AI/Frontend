interface LeafletMouseEvent {
  latlng: L.LatLng;
  originalEvent: MouseEvent;
}

declare namespace L {
  class LatLng {
    lat: number;
    lng: number;
  }
  interface Map {
    setView(center: [number, number], zoom: number): this;
    panTo(latlng: [number, number]): this;
    invalidateSize(): this;
    on(type: "click", fn: (e: LeafletMouseEvent) => void): this;
    remove(): void;
  }
  interface Layer {
    addTo(map: Map | LayerGroup): this;
  }
  interface LayerGroup extends Layer {
    clearLayers(): this;
  }
  interface CircleMarker extends Layer {
    bindTooltip(content: string): this;
    on(type: "click", fn: (e: LeafletMouseEvent) => void): this;
  }
  interface PathOptions {
    radius?: number;
    color?: string;
    weight?: number;
    fillColor?: string;
    fillOpacity?: number;
  }
  interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
  }
  interface MapOptions {
    scrollWheelZoom?: boolean;
  }
  function map(el: HTMLElement, options?: MapOptions): Map;
  function tileLayer(url: string, options?: TileLayerOptions): Layer;
  function layerGroup(): LayerGroup;
  function circleMarker(latlng: [number, number], options?: PathOptions): CircleMarker;
  namespace DomEvent {
    function stopPropagation(e: LeafletMouseEvent): void;
  }
}
