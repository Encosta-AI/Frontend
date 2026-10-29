import { useState } from "react";
import { FiMenu, FiPhone, FiX } from "react-icons/fi";
import type { InspectionPrefill } from "../types";

const links = [
  { href: "#empresa", label: "A empresa" },
  { href: "#atuacao", label: "Atuação" },
  { href: "#como", label: "Monitoramento" },
  { href: "#alertas", label: "Alertas" },
  { href: "#mapa", label: "Mapa de risco" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#topo" className={`flex min-w-0 items-center gap-2.5 font-display text-xl font-bold sm:text-2xl ${dark ? "text-navy" : "text-white"}`}>
      <img src="/logoIcone.png" alt="" className="h-10 w-10 shrink-0" />
      <span className="truncate">Encosta Ai</span>
    </a>
  );
}

export default function Header({ onRequest }: { onRequest: (p?: InspectionPrefill) => void }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header id="topo" className="sticky top-0 z-30 shadow-sm">
      <div className="bg-navy text-[13px] text-white/90">
        <div className="page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
          <span className="hidden sm:block">Monitoramento geotécnico de encostas e barreiras</span>
          <span className="flex min-w-0 items-center gap-2"><FiPhone className="shrink-0" aria-hidden /> Emergência: Defesa Civil 199 · Bombeiros 193</span>
        </div>
      </div>
      <div className="border-b border-line bg-white">
        <div className="page flex h-16 items-center justify-between gap-3 sm:h-18">
          <Logo dark />
          <nav className="hidden items-center gap-7 xl:flex" aria-label="Principal">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[15px] font-medium text-navy hover:text-sky">{l.label}</a>
            ))}
            <button className="btn btn-primary" onClick={() => onRequest()}>Solicitar vistoria</button>
          </nav>
          <div className="flex items-center gap-2 xl:hidden">
            <button className="btn btn-primary hidden px-3 py-2 sm:inline-flex" onClick={() => onRequest()}>Solicitar vistoria</button>
            <button
              type="button"
              className="grid size-11 cursor-pointer place-items-center rounded-sm text-2xl text-navy"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
        <nav id="menu-mobile" hidden={!open} className="border-t border-line xl:hidden" aria-label="Principal">
          <div className="page grid gap-1 py-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={close} className="rounded-sm px-2 py-3 text-[15px] font-medium text-navy hover:bg-surface">{l.label}</a>
            ))}
            <button className="btn btn-primary mt-2 w-full sm:hidden" onClick={() => { close(); onRequest(); }}>Solicitar vistoria</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
