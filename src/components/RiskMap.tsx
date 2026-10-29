import { useEffect, useMemo, useRef, useState } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { AREAS } from "../data/areas";
import type { InspectionPrefill } from "../types";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type LatLng = { lat: number; lng: number };

export default function RiskMap({ onRequest }: { onRequest: (p?: InspectionPrefill) => void }) {
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [sel, setSel] = useState<number | null>(null);
  const [clique, setClique] = useState<LatLng | null>(null);

  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const cidades = useMemo(() => [...new Set(AREAS.map((a) => a.cidade))].sort(), []);
  const lista = useMemo(() => {
    const n = norm(q.trim());
    return AREAS.filter(
      (a) =>
        (!n || norm(`${a.nome} ${a.cidade}`).includes(n)) &&
        (!cidade || a.cidade === cidade) &&
        (!tipo || a.tipo === tipo)
    );
  }, [q, cidade, tipo]);

  const atual = lista.find((a) => a.id === sel);
  const bar = "field !border-transparent !bg-surface";
  const coords = atual ? { lat: atual.lat, lng: atual.lng } : clique;

  useEffect(() => {
    const el = host.current;
    if (!el || mapRef.current) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView([-8.12, -34.97], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    map.on("click", (e) => {
      setSel(null);
      setClique({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    mapRef.current = map;
    const fit = () => map.invalidateSize();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    window.addEventListener("orientationchange", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", fit);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!atual || !mapRef.current) return;
    mapRef.current.panTo([atual.lat, atual.lng]);
  }, [atual]);

  return (
    <section id="mapa" className="py-14 sm:py-20">
      <div className="page">
        <h2 className="text-3xl md:text-4xl">Mapa</h2>
        <p className="mt-3 mb-8 max-w-2xl text-muted">
          Pesquise por localidade, município ou tipo de estrutura. Clique no mapa para marcar a latitude e a longitude da vistoria.
        </p>

        <div role="search" className="grid gap-2 rounded border border-line bg-white p-2 shadow-sm md:grid-cols-[1.6fr_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Buscar área</span>
            <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-brand" aria-hidden />
            <input className={`${bar} pl-11!`} type="search" placeholder="Buscar por bairro, rua ou comunidade" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select aria-label="Município" className={bar} value={cidade} onChange={(e) => setCidade(e.target.value)}>
            <option value="">Todos os municípios</option>
            {cidades.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Tipo de estrutura" className={bar} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Encostas e barreiras</option>
            <option>Encosta</option>
            <option>Barreira</option>
          </select>
        </div>

        <p className="mt-4 mb-6 text-right text-sm text-muted" aria-live="polite">
          {lista.length} {lista.length === 1 ? "área encontrada" : "áreas encontradas"}
        </p>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div ref={host} className="z-0 h-[min(70vh,28rem)] min-h-72 overflow-hidden rounded border border-line sm:h-128" role="application" aria-label="Mapa da região metropolitana" />

          <ul className="flex max-h-80 flex-col gap-2 overflow-auto pr-1 sm:max-h-128">
            {lista.length === 0 && <li className="p-6 text-center text-muted">Nenhuma área encontrada. Limpe os filtros ou busque outro nome.</li>}
            {lista.map((a) => (
              <li key={a.id}>
                <button onClick={() => { setClique(null); setSel(a.id); }} className={`w-full cursor-pointer rounded border bg-white p-3 text-left hover:border-sky ${a.id === sel ? "border-sky" : "border-line"}`}>
                  <b className="block text-[15px]">{a.nome}</b>
                  <span className="text-[13px] text-muted">{a.cidade} · {a.tipo}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-white p-5">
          {atual ? (
            <>
              <div>
                <h3 className="flex items-center gap-2 text-xl"><FiMapPin className="text-brand" aria-hidden />{atual.nome}</h3>
                <p className="mt-1 text-sm text-muted">
                  {atual.cidade} · {atual.tipo} · {atual.sensores} sensores ativos · última leitura {atual.leitura}
                  {" · "}{atual.lat.toFixed(5)}, {atual.lng.toFixed(5)}
                </p>
              </div>
              <button className="btn btn-primary w-full sm:w-auto" onClick={() => onRequest({ local: atual.nome, cidade: atual.cidade, lat: atual.lat, lng: atual.lng })}>Solicitar vistoria neste local</button>
            </>
          ) : clique ? (
            <>
              <div>
                <h3 className="flex items-center gap-2 text-xl"><FiMapPin className="text-brand" aria-hidden />Ponto marcado no mapa</h3>
                <p className="mt-1 text-sm text-muted">
                  Latitude {clique.lat.toFixed(6)} · Longitude {clique.lng.toFixed(6)}. Esses valores entram no formulário de vistoria.
                </p>
              </div>
              <button className="btn btn-primary w-full sm:w-auto" onClick={() => onRequest({ lat: clique.lat, lng: clique.lng })}>Solicitar vistoria neste ponto</button>
            </>
          ) : (
            <p className="text-muted">Selecione um ponto na lista ou clique no mapa para preencher a latitude e a longitude.</p>
          )}
        </div>
        {coords && <span className="sr-only">Coordenadas selecionadas: {coords.lat}, {coords.lng}</span>}
      </div>
    </section>
  );
}
