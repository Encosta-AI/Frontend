import { FiBell, FiClipboard, FiLayers, FiShield } from "react-icons/fi";

const services = [
  { icon: FiLayers, title: "Monitoramento de encostas", text: "Acompanhamento do solo em taludes e morros com ESP32, MPU6050 (inclinação e vibração) e sensor capacitivo de umidade." },
  { icon: FiShield, title: "Monitoramento de barreiras", text: "Controle de muros e estruturas de contenção, com câmera IP infravermelha para registro visual contínuo." },
  { icon: FiClipboard, title: "Vistorias técnicas", text: "Avaliação em campo por engenheiros, com indicação da necessidade de instrumentação." },
  { icon: FiBell, title: "Alertas e comunicação de risco", text: "A comunicação de risco é feita apenas pela Defesa Civil, com orientações de segurança e pontos de apoio." },
];

export default function Services() {
  return (
    <section id="atuacao" className="bg-white py-20">
      <div className="page">
        <h2 className="text-3xl md:text-4xl">Áreas de atuação</h2>
        <p className="mt-3 max-w-2xl text-muted">Soluções para prefeituras, condomínios, empresas e comunidades que convivem com áreas de risco.</p>
        <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
          {services.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex min-w-0 gap-4 bg-white p-5 sm:gap-5 sm:p-8">
              <Icon className="mt-1 flex-none text-3xl text-brand" aria-hidden />
              <div>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 text-[15px] text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
