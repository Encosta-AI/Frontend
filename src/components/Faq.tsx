import { FiChevronDown } from "react-icons/fi";

const faqs = [
  { q: "Como recebo os alertas?", a: "Os alertas são emitidos apenas pela Defesa Civil, quando o monitoramento indica mudança no nível de risco da área." },
  { q: "Quem pode solicitar uma vistoria?", a: "Moradores, síndicos, empresas e órgãos públicos. Basta informar o local da encosta ou barreira no formulário de solicitação." },
  { q: "Em quanto tempo a equipe retorna?", a: "Entramos em contato em até 2 dias úteis para agendar a vistoria técnica." },
  { q: "O que fazer ao receber um alerta de risco alto?", a: "Siga a orientação da Defesa Civil: deixe o local imediatamente e vá ao ponto de apoio indicado. Em emergência, ligue para a Defesa Civil (199) ou para os Bombeiros (193)." },
];

export default function Faq() {
  return (
    <section id="duvidas" className="bg-white py-20">
      <div className="page max-w-4xl">
        <h2 className="text-3xl md:text-4xl">Perguntas frequentes</h2>
        <div className="mt-10 border-t border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-navy">
                {f.q}
                <FiChevronDown className="flex-none transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 max-w-3xl text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
