import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Indicators from "./components/Indicators";
import About from "./components/About";
import Services from "./components/Services";
import Faq from "./components/Faq";
import HowItWorks from "./components/HowItWorks";
import Alerts from "./components/Alerts";
import RiskMap from "./components/RiskMap";
import InspectionModal from "./components/InspectionModal";
import Footer from "./components/Footer";
import type { InspectionPrefill } from "./types";

export default function App() {
  const [modal, setModal] = useState<{ key: number; prefill: InspectionPrefill } | null>(null);
  const openInspection = (prefill: InspectionPrefill = {}) =>
    setModal({ key: Date.now(), prefill });

  return (
    <>
      <Header onRequest={openInspection} />
      <main>
        <Hero onRequest={openInspection} />
        <Indicators />
        <About />
        <Services />
        <HowItWorks />
        <Alerts />
        <RiskMap onRequest={openInspection} />
        <Faq />
        <section className="bg-brand px-0 py-14 text-center text-white sm:py-16">
          <div className="page">
            <h2 className="text-white text-3xl">Mora ou trabalha perto de uma barreira ou encosta?</h2>
            <p className="mx-auto mt-3 mb-7 max-w-xl text-white/80">
              Solicite uma vistoria técnica. Nossa equipe avalia o local e indica a necessidade de monitoramento.
            </p>
            <button className="btn btn-light w-full sm:w-auto" onClick={() => openInspection()}>
              Solicitar vistoria
            </button>
          </div>
        </section>
      </main>
      <Footer />
      {modal && (
        <InspectionModal key={modal.key} prefill={modal.prefill} onClose={() => setModal(null)} />
      )}
    </>
  );
}
