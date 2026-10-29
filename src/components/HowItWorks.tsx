import { FiActivity, FiBell, FiTool, FiWifi } from "react-icons/fi";

const steps = [
  { icon: FiTool, title: "Instalação", text: "Sensores de umidade, inclinação e movimento são instalados no solo. Câmeras cobrem os pontos críticos." },
  { icon: FiWifi, title: "Coleta de dados", text: "Os equipamentos transmitem leituras e imagens sem fio para a central de monitoramento, em intervalos curtos." },
  { icon: FiActivity, title: "Análise técnica", text: "Engenheiros e sistemas comparam as leituras com o histórico da área e com a previsão de chuva." },
  { icon: FiBell, title: "Alerta", text: "Ao identificar risco, a informação segue apenas para a Defesa Civil, que emite o alerta à população." },
];

export default function HowItWorks() {
  return (
    <section id="como" className="border-y border-line bg-white py-20">
      <div className="page">
        <h2 className="text-3xl md:text-4xl">Como realizamos o monitoramento</h2>
        <p className="mt-3 max-w-2xl text-muted">O processo segue quatro etapas, do solo até o alerta da Defesa Civil.</p>
        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-navy text-xl text-white">
                  <Icon aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold text-brand">Etapa {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
