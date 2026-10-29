const items = [
  { n: "24 h", t: "Monitoramento todos os dias, sem interrupção" },
  { n: "2 tipos", t: "de monitoramento: sensores de vibração e inclinação e câmeras infravermelhas" },
  { n: "4 níveis", t: "de classificação de risco: baixo, médio, alto e crítico" },
  { n: "Defesa Civil", t: "único canal de alerta à população" },
];

export default function Indicators() {
  return (
    <div className="bg-brand text-white">
      <dl className="page grid grid-cols-1 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.n} className="border-l border-white/30 pl-5">
            <dt className="font-display text-3xl font-bold">{i.n}</dt>
            <dd className="mt-1 max-w-[16rem] text-sm text-white/80">{i.t}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
