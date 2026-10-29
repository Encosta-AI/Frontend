import { FiEye, FiShield, FiTarget } from "react-icons/fi";

const pillars = [
  { icon: FiTarget, title: "Missão", text: "Proteger vidas e patrimônio por meio do monitoramento contínuo de encostas e barreiras e da comunicação rápida de riscos." },
  { icon: FiEye, title: "Visão", text: "Ser referência em prevenção de desastres geotécnicos, apoiando comunidades e órgãos públicos com dados confiáveis." },
  { icon: FiShield, title: "Valores", text: "Segurança, rigor técnico, transparência das informações e respeito às comunidades atendidas." },
];

export default function About() {
  return (
    <section id="empresa" className="py-20">
      <div className="page">
        <div className="grid gap-8 lg:grid-cols-2">
          <h2 className="text-3xl md:text-4xl">Sobre a empresa</h2>
          <p className="text-lg text-muted">
            Enc osta Ai é uma empresa dedicada ao monitoramento de barreiras e encostas. Instalamos sensores e câmeras no solo, acompanhamos os dados em nossa central e, ao identificar risco, comunicamos apenas a Defesa Civil, que emite o alerta.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-(--radius-card) border border-line border-t-4 border-t-brand bg-white p-7">
              <Icon className="text-2xl text-brand" aria-hidden />
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
