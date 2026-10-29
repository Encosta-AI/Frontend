import { useEffect, useState, type FormEvent } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import type { InspectionPrefill } from "../types";

interface Props { prefill: InspectionPrefill; onClose: () => void }

export default function InspectionModal({ prefill, onClose }: Props) {
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // TODO: enviar `data` para sua API / e-mail
    console.log("Solicitação de vistoria:", data);
    setNome(String(data.nome).split(" ")[0]);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-navy/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="vt" className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-auto rounded bg-white shadow-2xl">
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 cursor-pointer text-2xl text-muted"><FiX /></button>
        {nome ? (
          <div className="p-10 text-center">
            <FiCheckCircle className="mx-auto text-5xl text-risk-low" aria-hidden />
            <h2 className="mt-3 text-2xl">Solicitação enviada</h2>
            <p className="mt-2 mb-6 text-muted">Obrigado, {nome}. Recebemos seu pedido e entraremos em contato para agendar a vistoria.</p>
            <button className="btn btn-primary" onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3.5 p-5 sm:p-7">
            <h2 id="vt" className="text-2xl">Solicitar vistoria</h2>
            <p className="-mt-1 text-sm text-muted">Informe a localização da encosta ou barreira. Retornamos em até 2 dias úteis.</p>
            <label className="grid gap-1 text-sm font-semibold">Nome completo<input name="nome" required autoComplete="name" className="field" /></label>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Telefone ou WhatsApp<input name="telefone" type="tel" required autoComplete="tel" className="field" /></label>
              <label className="grid gap-1 text-sm font-semibold">E-mail<input name="email" type="email" autoComplete="email" className="field" /></label>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Município<input name="cidade" required defaultValue={prefill.cidade} className="field" /></label>
              <label className="grid gap-1 text-sm font-semibold">Tipo de local
                <select name="tipo" className="field"><option>Encosta</option><option>Barreira</option><option>Muro de contenção</option><option>Não sei informar</option></select>
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold">Endereço ou ponto de referência<input name="endereco" required defaultValue={prefill.local} className="field" /></label>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Latitude
                <input name="latitude" inputMode="decimal" defaultValue={prefill.lat?.toFixed(6) ?? ""} className="field" placeholder="Clique no mapa" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">Longitude
                <input name="longitude" inputMode="decimal" defaultValue={prefill.lng?.toFixed(6) ?? ""} className="field" placeholder="Clique no mapa" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold">O que você observa? (rachaduras, água saindo, deslizamentos)<textarea name="descricao" rows={3} className="field" /></label>
            <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn border border-line text-ink hover:bg-surface" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Enviar solicitação</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
