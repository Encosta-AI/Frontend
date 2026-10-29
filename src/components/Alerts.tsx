import { FiShield } from "react-icons/fi";
import { RISK_META } from "../data/areas";
import type { Risk } from "../types";

const levels: { risk: Risk; text: string }[] = [
  { risk: "baixo", text: "Solo monitorado, sem sinais de movimentação." },
  { risk: "medio", text: "Solo saturado ou com pequena movimentação. Mantenha atenção." },
  { risk: "alto", text: "Movimento detectado. Deixe o local e siga para o ponto de apoio." },
  { risk: "critico", text: "Ruptura iminente. Saia imediatamente e siga a orientação da Defesa Civil." },
];

const channels = [
  { icon: FiShield, label: "Defesa Civil" },
];

const examples: { risk: Risk; hora: string; msg: string }[] = [
  { risk: "baixo", hora: "08:12", msg: "Chuva fraca. A encosta do seu endereço está estável." },
  { risk: "medio", hora: "14:40", msg: "Solo com 85% de saturação. Evite permanecer nos cômodos voltados para a encosta." },
  { risk: "alto", hora: "15:05", msg: "RISCO ALTO. Movimento detectado. Saia agora e vá ao ponto de apoio mais próximo." },
  { risk: "critico", hora: "15:18", msg: "RISCO CRÍTICO. Ruptura iminente. Saia imediatamente e siga a Defesa Civil." },
];

export default function Alerts() {
  return (
    <section id="alertas" className="bg-navy py-20 text-white">
      <div className="page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl text-white! md:text-4xl">Alertas emitidos pela Defesa Civil em caso de risco</h2>
          <p className="mt-4 text-white/75">
            Quando o monitoramento indica risco, a informação segue apenas para a Defesa Civil, que emite o alerta à população.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {channels.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-sm border border-white/20 px-4 py-2 text-sm">
                <Icon aria-hidden /> {label}
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid gap-4">
            {levels.map(({ risk, text }) => (
              <li key={risk} className="flex items-start gap-3 text-white/85">
                <span className={`mt-1.5 size-3.5 flex-none rounded-full ${RISK_META[risk].bg}`} />
                <span><b className="text-white">{RISK_META[risk].label}.</b> {text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-md bg-white p-5 text-ink shadow-2xl" aria-label="Exemplo de alertas">
          {examples.map((m) => (
            <div key={m.hora} className="mb-3 rounded border-l-4 bg-surface p-3 text-sm last:mb-0" style={{ borderColor: RISK_META[m.risk].fill }}>
              <small className="mb-0.5 block text-muted">Defesa Civil · {m.hora}</small>
              {m.msg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
