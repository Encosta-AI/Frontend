import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { Logo } from "./Header";

const cols = [
  { t: "Institucional", l: [["A empresa", "#empresa"], ["Áreas de atuação", "#atuacao"], ["Perguntas frequentes", "#duvidas"]] },
  { t: "Serviços", l: [["Como monitoramos", "#como"], ["Alertas de risco", "#alertas"], ["Mapa de risco", "#mapa"]] },
];

export default function Footer() {
  return (
    <footer className="bg-navy pt-14 text-sm text-white/70">
      <div className="page grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs">Engenharia geotécnica dedicada ao monitoramento de encostas e barreiras e à comunicação de riscos.</p>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <h3 className="text-white! font-sans text-base font-semibold">{c.t}</h3>
            <ul className="mt-3 grid gap-2">
              {c.l.map(([label, href]) => <li key={href}><a href={href} className="hover:text-white">{label}</a></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="text-white! font-sans text-base font-semibold">Contato</h3>
          <ul className="mt-3 grid gap-2">
            <li className="flex items-center gap-2"><FiPhone aria-hidden /> (81) 0000-0000</li>
            <li className="flex min-w-0 items-center gap-2"><FiMail className="shrink-0" aria-hidden /> <span className="break-all">contato@geovigia.com.br</span></li>
            <li className="flex items-center gap-2"><FiMapPin aria-hidden /> Recife, Pernambuco</li>
          </ul>
          <p className="mt-4"><b className="text-white">Emergência:</b> Defesa Civil 199 · Bombeiros 193</p>
        </div>
      </div>
      <div className="mt-12 border-t border-white/15 py-5">
        <div className="page">© 2026 GeoVigia Monitoramento Geotécnico. Todos os direitos reservados.</div>
      </div>
    </footer>
  );
}
