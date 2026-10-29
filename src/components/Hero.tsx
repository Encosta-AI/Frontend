import { FiBell, FiChevronRight, FiClipboard, FiMap } from "react-icons/fi";
import heroImage from "../assets/heroImage.png";
import type { InspectionPrefill } from "../types";

export default function Hero({ onRequest }: { onRequest: (p?: InspectionPrefill) => void }) {
  const row = "group flex w-full cursor-pointer items-center gap-4 border-b border-white/15 p-5 text-left last:border-0 hover:bg-white/10";
  return (
    <section
      className="border-b border-line bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="page grid gap-10 py-16 lg:grid-cols-[1.3fr_0.4fr] lg:items-center lg:py-20">
        <div>
          <p className="mb-4 text-sm font-semibold text-brand">Engenharia geotécnica e prevenção de desastres</p>
          <h1 className="text-3xl leading-tight sm:text-4xl md:text-[2.9rem]">
            Monitoramento contínuo de barreiras e encostas para proteger pessoas e patrimônios.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Sensores e câmeras instalados no solo, central técnica em operação permanente e alertas emitidos pela Defesa Civil sempre que há risco.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#mapa" className="btn btn-primary">Consultar mapa de risco</a>
            <a href="#empresa" className="btn border border-navy text-navy hover:bg-navy hover:text-white">Solicitar vistoria</a>
          </div>
        </div>
      </div>
    </section>
  );
}
