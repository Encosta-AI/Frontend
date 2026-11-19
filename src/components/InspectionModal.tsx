import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiCheckCircle, FiChevronDown, FiX } from "react-icons/fi";
import { ApiError, api } from "../api";
import type { InspectionPrefill } from "../types";

const tipos = ["Encosta", "Barreira", "Muro de contenção", "Não sei informar"];

function TipoLocal() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState(tipos[0]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={box} className="relative">
      <input type="hidden" name="tipo" value={tipo} />
      <button
        type="button"
        className="field flex cursor-pointer items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {tipo}
        <FiChevronDown className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-line bg-white shadow-lg">
          {tipos.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === tipo}
                className="w-full cursor-pointer px-3.5 py-2.5 text-left text-[15px] hover:bg-surface"
                onClick={() => { setTipo(item); setOpen(false); }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props { prefill: InspectionPrefill; onClose: () => void }

export default function InspectionModal({ prefill, onClose }: Props) {
  const [nome, setNome] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setErro("");
    setEnviando(true);
    try {
      await api("/api/vistorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: String(data.nome ?? "").trim(),
          telefone: String(data.telefone ?? "").trim(),
          email: String(data.email ?? "").trim() || null,
          cidade: String(data.cidade ?? "").trim(),
          tipo: data.tipo,
          endereco: String(data.endereco ?? "").trim(),
          descricao: String(data.descricao ?? "").trim() || null,
          consentimento: data.consentimento === "on",
          site: String(data.site ?? ""),
        }),
      });
      setNome(String(data.nome).split(" ")[0]);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível enviar a solicitação.");
      setEnviando(false);
    }
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
          <form onSubmit={(e) => void submit(e)} className="grid gap-3.5 p-5 sm:p-7">
            <h2 id="vt" className="text-2xl">Solicitar vistoria</h2>
            <p className="-mt-1 text-sm text-muted">Informe a localização da encosta ou barreira. Retornamos em até 2 dias úteis.</p>
            <label className="grid gap-1 text-sm font-semibold">Nome completo<input name="nome" required minLength={3} maxLength={100} autoComplete="name" className="field" /></label>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Telefone ou WhatsApp<input name="telefone" type="tel" required autoComplete="tel" className="field" /></label>
              <label className="grid gap-1 text-sm font-semibold">E-mail<input name="email" type="email" autoComplete="email" className="field" /></label>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Município<input name="cidade" required defaultValue={prefill.cidade} className="field" /></label>
              <label className="grid cursor-pointer gap-1 text-sm font-semibold">Tipo de local
                <TipoLocal />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold">Endereço ou ponto de referência<input name="endereco" required defaultValue={prefill.local} className="field" /></label>
            <label className="grid gap-1 text-sm font-semibold">O que você observa? (rachaduras, água saindo, deslizamentos)<textarea name="descricao" rows={3} maxLength={1000} className="field" /></label>
            <label className="flex items-start gap-2 text-sm">
              <input name="consentimento" type="checkbox" required className="mt-1" />
              Concordo com o uso desses dados para agendar a vistoria.
            </label>
            <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0" />
            {erro && <p role="alert" className="text-sm text-risk-high">{erro}</p>}
            <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn border border-line text-ink hover:bg-surface" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? "Enviando…" : "Enviar solicitação"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
