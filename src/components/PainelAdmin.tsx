import { FormEvent, useEffect, useRef, useState } from "react";
import { ApiError, api, apiBase } from "../api";
import "../styles/painel.css";

type Nivel = "verde" | "amarelo" | "laranja" | "vermelho";
type StatusVistoria = "nova" | "em_analise" | "concluida";

interface Ruptura {
  ok: boolean;
  ruptura_em?: string;
  antecipada_min?: number;
  qualidade?: number;
  pontos?: number;
  motivo?: string;
}

interface Encosta {
  id: number;
  nome: string;
  bairro: string;
  municipio: string;
  lat: number;
  lon: number;
  nivel: Nivel | null;
  confianca: number | null;
  prob_vermelho: number | null;
  por_limiar: boolean | number | null;
  chuva_24h: number | null;
  chuva_72h: number | null;
  umidade_solo: number | null;
  inclinacao: number | null;
  fluxo_optico: number | null;
  aceleracao: number | null;
  tem_lona: number | null;
  ruptura: Ruptura | null;
}

interface LeituraHist {
  criado_em: string;
  nivel: Nivel;
  confianca: number;
}

interface Vistoria {
  id: number;
  criado_em: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cidade: string;
  tipo: string;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  descricao: string | null;
  status: StatusVistoria;
}

interface AnaliseLona {
  classe: string;
  confianca: number;
  tem_lona: number;
}

const NIVEIS: Nivel[] = ["verde", "amarelo", "laranja", "vermelho"];
const ROTULOS: Record<Nivel, string> = {
  verde: "Verde · baixo",
  amarelo: "Amarelo · atenção",
  laranja: "Laranja · alto",
  vermelho: "Vermelho · crítico",
};
const CORES: Record<Nivel, string> = {
  verde: "#2e9e5b",
  amarelo: "#e3b93c",
  laranja: "#e8833a",
  vermelho: "#d64545",
};
const CAMPOS = [
  ["chuva_24h", "Chuva em 24 h", "mm", 0, 200, 1, 40],
  ["chuva_72h", "Chuva em 72 h", "mm", 0, 400, 1, 100],
  ["umidade_solo", "Umidade do solo", "%", 0, 100, 1, 50],
  ["inclinacao", "Inclinação", "°", 0, 10, 0.1, 1.5],
  ["fluxo_optico", "Velocidade do solo", "px/h", 0, 15, 0.1, 2],
  ["aceleracao", "Aceleração", "px/h²", -3, 4, 0.1, 0],
] as const;
const ROT_STATUS: Record<StatusVistoria, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  concluida: "Concluída",
};
const COR_VIST = "#0485fe";
const MAX_FOTO = 3 * 1024 * 1024;

type Campo = (typeof CAMPOS)[number][0];
type SimValores = Record<Campo, number> & { tem_lona: boolean };

const simInicial = (): SimValores => ({
  chuva_24h: 40,
  chuva_72h: 100,
  umidade_solo: 50,
  inclinacao: 1.5,
  fluxo_optico: 2,
  aceleracao: 0,
  tem_lona: false,
});

const fmt = (v: number | null | undefined, casas = 1) =>
  v === null || v === undefined ? "–" : Number(v).toFixed(casas).replace(".", ",");
const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const indice = (nivel: Nivel | null) => (nivel ? NIVEIS.indexOf(nivel) : -1);
const porLimiar = (v: Encosta["por_limiar"]) => v === true || v === 1;

function contagem(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "iminente";
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const seg = t % 60;
  const dois = (n: number) => String(n).padStart(2, "0");
  return (h ? `${h} h ` : "") + `${dois(m)} min ${dois(seg)} s`;
}

function Relogio({ iso, className }: { iso: string; className?: string }) {
  const [texto, setTexto] = useState(() => contagem(iso));
  useEffect(() => {
    const id = window.setInterval(() => setTexto(contagem(iso)), 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  return <span className={className ?? "tempo"}>{texto}</span>;
}

function sessaoEncerrada(erro: unknown) {
  return erro instanceof ApiError && erro.status === 401;
}

function FundoLogin() {
  return (
    <div className="login-fundo" aria-hidden="true">
      <img src="/login-building.png" alt="" className="login-predio" />
      <svg className="login-canto login-canto-esq" viewBox="0 0 280 150">
        <path fill="#0c62d0" d="M206 0h74C236 34 196 64 162 82c22-22 36-52 44-82Z" />
        <path fill="#102448" d="M0 0h188C168 46 124 90 62 120 34 134 14 144 0 148Z" />
      </svg>
      <svg className="login-canto login-canto-dir" viewBox="0 0 360 210">
        <path fill="#067eef" d="M360 210H28c62-28 128-58 196-78 48 22 96 52 136 78Z" />
        <path fill="#102448" d="M360 78c-28 18-78 52-156 92 42 16 98 32 156 40Z" />
      </svg>
    </div>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setMsg("");
    if (!usuario.trim() || !senha) {
      setMsg("Informe o usuário e a senha.");
      return;
    }
    setEnviando(true);
    try {
      await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuario.trim(), senha }),
      });
      onOk();
    } catch (erro) {
      setMsg(erro instanceof Error ? erro.message : "Não foi possível entrar.");
      setSenha("");
      setEnviando(false);
    }
  };

  return (
    <div className="painel-app pagina-login">
      <FundoLogin />
      <main className="login-area">
        <a href="#topo" className="voltar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Voltar
        </a>
        <header className="login-marca">
          <img src="/logo-encosta-ai.png" alt="Encosta Ai" className="login-logo" />
          <p>Monitoramento inteligente de barreiras</p>
        </header>
        <section className="caixa-login" aria-labelledby="titulo-login">
          <span className="selo-admin">Administrador</span>
          <h1 id="titulo-login">Acesse o painel</h1>
          <p className="sub">Entre com as credenciais da equipe ou da Defesa Civil para continuar.</p>
          <form id="form-login" onSubmit={enviar} noValidate>
            <label htmlFor="usuario">Usuário</label>
            <div className="campo">
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M4.8 20c.6-3.7 3.4-5.6 7.2-5.6s6.6 1.9 7.2 5.6" />
              </svg>
              <input id="usuario" autoComplete="username" placeholder="Seu usuário" required maxLength={80} autoFocus value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
            <label htmlFor="senha">Senha</label>
            <div className="campo">
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
                <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
              </svg>
              <input id="senha" type={mostrar ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" required maxLength={200} value={senha} onChange={(e) => setSenha(e.target.value)} />
              <button type="button" className="olho" aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"} aria-pressed={mostrar} onClick={() => setMostrar((v) => !v)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                  <circle cx="12" cy="12" r="2.8" />
                </svg>
              </button>
            </div>
            <p className="erro-login" role="alert">{msg}</p>
            <button type="submit" className="entrar" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
          </form>
        </section>
        <p className="login-rodape">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3l7 3v5.5c0 4.4-2.9 8-7 9.5-4.1-1.5-7-5.1-7-9.5V6l7-3z" />
            <path d="M9 12l2.2 2.2L15.2 10" />
          </svg>
          Acesso restrito · Moradores devem usar o site público para solicitar uma vistoria
        </p>
      </main>
    </div>
  );
}

function Camera({ encosta, onMudou, onSessao }: { encosta: Encosta; onMudou: () => void; onSessao: () => void }) {
  const [foto, setFoto] = useState<string | null>(null);
  const [semFoto, setSemFoto] = useState(false);
  const [msg, setMsg] = useState("");
  const [lonaTexto, setLonaTexto] = useState("");
  const [acaoLona, setAcaoLona] = useState<string | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const urlFoto = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setSemFoto(false);
    setFoto(null);
    fetch(`${apiBase}/api/encostas/${encosta.id}/foto?t=${Date.now()}`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) throw new ApiError("sessão", 401);
        if (!r.ok) throw new Error("sem foto");
        const url = URL.createObjectURL(await r.blob());
        if (!ativo) { URL.revokeObjectURL(url); return; }
        if (urlFoto.current) URL.revokeObjectURL(urlFoto.current);
        urlFoto.current = url;
        setFoto(url);
      })
      .catch((erro) => {
        if (!ativo) return;
        if (sessaoEncerrada(erro)) onSessao();
        else setSemFoto(true);
      });
    api<{ disponivel: boolean; analise: AnaliseLona | null }>(`/api/encostas/${encosta.id}/lona`)
      .then((r) => {
        if (!ativo) return;
        if (!r.disponivel) { setLonaTexto("Análise de lona indisponível (modelo não instalado)."); setAcaoLona(null); return; }
        if (!r.analise) { setLonaTexto("Envie uma foto para analisar a lona."); setAcaoLona(null); return; }
        setLonaTexto(`Análise da foto: ${r.analise.classe} (${r.analise.confianca}% de confiança).`);
        setAcaoLona(r.analise.tem_lona === encosta.tem_lona ? null : r.analise.tem_lona ? "Marcar lona na leitura" : "Marcar sem lona na leitura");
      })
      .catch((erro) => { if (sessaoEncerrada(erro)) onSessao(); else if (ativo) setLonaTexto(""); });
    return () => { ativo = false; };
  }, [encosta.id, encosta.tem_lona, onSessao]);

  useEffect(() => () => { if (urlFoto.current) URL.revokeObjectURL(urlFoto.current); }, []);

  const enviar = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FOTO) { setMsg("Imagem grande demais (máximo 3 MB)."); return; }
    try {
      await api(`/api/encostas/${encosta.id}/foto`, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setMsg("Foto atualizada.");
      onMudou();
    } catch (erro) {
      if (sessaoEncerrada(erro)) onSessao();
      else setMsg(erro instanceof Error ? erro.message : "Erro ao enviar a foto.");
    }
  };

  const aplicar = async () => {
    try {
      await api(`/api/encostas/${encosta.id}/lona/aplicar`, { method: "POST" });
      onMudou();
    } catch (erro) {
      if (sessaoEncerrada(erro)) onSessao();
      else setLonaTexto(erro instanceof Error ? erro.message : "");
    }
  };

  return (
    <div className="camera">
      <h3>Câmera</h3>
      {foto && <img src={foto} alt={`Última imagem da câmera de ${encosta.nome}`} />}
      {semFoto && <p className="dica">Sem imagem da câmera ainda.</p>}
      <input ref={arquivo} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => { void enviar(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" className="sec" onClick={() => arquivo.current?.click()}>Enviar foto (teste)</button>
      <p className="dica" role="status">{msg}</p>
      <div className="lona">
        <p className="dica" role="status">{lonaTexto}</p>
        {acaoLona && <button type="button" className="sec" onClick={() => void aplicar()}>{acaoLona}</button>}
      </div>
    </div>
  );
}

function Painel({ onSair }: { onSair: () => void }) {
  const [encostas, setEncostas] = useState<Encosta[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [historico, setHistorico] = useState<LeituraHist[]>([]);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [vistId, setVistId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<"abertas" | "todas">("abertas");
  const [verVist, setVerVist] = useState(true);
  const [atualizado, setAtualizado] = useState("Carregando…");
  const [tick, setTick] = useState(0);
  const [sim, setSim] = useState<SimValores>(simInicial);
  const [resultado, setResultado] = useState<{ nivel: Nivel; confianca: number; prob_vermelho: number; por_limiar: boolean } | null>(null);
  const [msgSim, setMsgSim] = useState("");
  const [msgChuva, setMsgChuva] = useState("");
  const [msgCad, setMsgCad] = useState("");
  const [msgDemo, setMsgDemo] = useState("");
  const [msgStatus, setMsgStatus] = useState("");

  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const grupoEnc = useRef<L.LayerGroup | null>(null);
  const grupoVist = useRef<L.LayerGroup | null>(null);
  const ajustado = useRef(false);
  const formCad = useRef<HTMLFormElement>(null);
  const sair = useRef(onSair);
  sair.current = onSair;

  const falhouSessao = (erro: unknown) => {
    if (sessaoEncerrada(erro)) { sair.current(); return true; }
    return false;
  };

  const carregar = async () => {
    try {
      const lista = await api<Encosta[]>("/api/encostas");
      setEncostas(lista);
      setAtualizado(`Atualizado às ${hora(new Date().toISOString())}`);
      setTick((n) => n + 1);
    } catch (erro) {
      if (falhouSessao(erro)) return;
      setAtualizado("Sem conexão com o servidor");
      return;
    }
    try {
      setVistorias(await api<Vistoria[]>("/api/vistorias"));
    } catch (erro) {
      falhouSessao(erro);
    }
  };

  useEffect(() => {
    void carregar();
    const id = window.setInterval(() => void carregar(), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selecionadaId) { setHistorico([]); return; }
    let ativo = true;
    api<LeituraHist[]>(`/api/encostas/${selecionadaId}/historico?limite=12`)
      .then((h) => { if (ativo) setHistorico(h); })
      .catch((erro) => falhouSessao(erro));
    return () => { ativo = false; };
  }, [selecionadaId, tick]);

  useEffect(() => {
    const el = host.current;
    if (!el || mapRef.current) return;
    const map = L.map(el).setView([-8.012, -34.91], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; colaboradores do OpenStreetMap",
    }).addTo(map);
    grupoEnc.current = L.layerGroup().addTo(map);
    grupoVist.current = L.layerGroup().addTo(map);
    map.on("click", (ev) => {
      const f = formCad.current;
      if (!f) return;
      (f.elements.namedItem("lat") as HTMLInputElement).value = ev.latlng.lat.toFixed(5);
      (f.elements.namedItem("lon") as HTMLInputElement).value = ev.latlng.lng.toFixed(5);
    });
    mapRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      grupoEnc.current = null;
      grupoVist.current = null;
    };
  }, []);

  useEffect(() => {
    const grupo = grupoEnc.current;
    const map = mapRef.current;
    if (!grupo || !map) return;
    grupo.clearLayers();
    encostas.forEach((e) => {
      const m = L.circleMarker([e.lat, e.lon], {
        radius: e.id === selecionadaId ? 15 : 11,
        color: e.id === selecionadaId ? "#0d345d" : "#ffffff",
        weight: e.id === selecionadaId ? 4 : 2.5,
        fillColor: e.nivel ? CORES[e.nivel] : "#8a979c",
        fillOpacity: 0.95,
      }).addTo(grupo);
      const dica = `${e.nome} · ${e.bairro}${e.nivel ? ` · ${ROTULOS[e.nivel]} · ${fmt(e.confianca, 0)}%` : " · sem leitura"}`;
      m.bindTooltip(dica);
      m.on("click", (ev) => {
        L.DomEvent.stopPropagation(ev);
        setSelecionadaId(e.id);
        map.panTo([e.lat, e.lon]);
      });
    });
    if (!ajustado.current && encostas.length) {
      map.fitBounds(encostas.map((e) => [e.lat, e.lon]), { padding: [40, 40], maxZoom: 15 });
      ajustado.current = true;
    }
  }, [encostas, selecionadaId]);

  const visiveis = vistorias.filter((v) => filtro === "todas" || v.status !== "concluida");

  useEffect(() => {
    const grupo = grupoVist.current;
    if (!grupo) return;
    grupo.clearLayers();
    if (!verVist) return;
    visiveis.filter((v) => v.latitude !== null && v.longitude !== null).forEach((v) => {
      const m = L.circleMarker([v.latitude as number, v.longitude as number], {
        radius: v.id === vistId ? 10 : 7,
        color: "#ffffff",
        weight: 2,
        fillColor: COR_VIST,
        fillOpacity: v.status === "concluida" ? 0.4 : 0.95,
      }).addTo(grupo);
      m.bindTooltip(`Vistoria #${v.id} · ${v.cidade} · ${ROT_STATUS[v.status]}`);
      m.on("click", (ev) => {
        L.DomEvent.stopPropagation(ev);
        setVistId(v.id);
        mapRef.current?.panTo([v.latitude as number, v.longitude as number]);
      });
    });
  }, [vistorias, filtro, verVist, vistId]);

  const selecionada = encostas.find((e) => e.id === selecionadaId) ?? null;
  const vistoria = vistorias.find((v) => v.id === vistId) ?? null;
  const emAlerta = encostas
    .filter((e) => e.ruptura?.ok && e.ruptura.ruptura_em)
    .sort((a, b) => new Date(a.ruptura!.ruptura_em!).getTime() - new Date(b.ruptura!.ruptura_em!).getTime());
  const ordenadas = [...encostas].sort((a, b) => (indice(b.nivel) - indice(a.nivel)) || ((b.confianca || 0) - (a.confianca || 0)));
  const novas = vistorias.filter((v) => v.status === "nova").length;

  const sairPainel = async () => {
    try { await api("/api/admin/logout", { method: "POST" }); } catch { /* a tela de login aparece mesmo se a rede falhar */ }
    onSair();
  };

  const calcular = async (ev: FormEvent) => {
    ev.preventDefault();
    setMsgSim("");
    const corpo = {
      chuva_24h: sim.chuva_24h,
      chuva_72h: sim.chuva_72h,
      umidade_solo: sim.umidade_solo,
      inclinacao: sim.inclinacao,
      fluxo_optico: sim.fluxo_optico,
      aceleracao: sim.aceleracao,
      tem_lona: sim.tem_lona ? 1 : 0,
    };
    try {
      setResultado(await api("/api/prever", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) }));
    } catch (erro) {
      if (falhouSessao(erro)) return;
      setResultado(null);
      setMsgSim(erro instanceof Error ? erro.message : "Erro ao calcular.");
    }
  };

  const usarChuva = async () => {
    try {
      const c = await api<{ ok: boolean; motivo?: string; chuva_24h: number; chuva_72h: number; estacao: string; ultima_medicao: string }>("/api/chuva?atualizar=true");
      if (!c.ok) { setMsgChuva(`Sem dados do INMET agora (${c.motivo}). Use os controles manuais.`); return; }
      setSim((s) => ({ ...s, chuva_24h: Math.min(c.chuva_24h, 200), chuva_72h: Math.min(c.chuva_72h, 400) }));
      setMsgChuva(`Estação ${c.estacao}: ${fmt(c.chuva_24h)} mm em 24 h e ${fmt(c.chuva_72h)} mm em 72 h (última medição ${hora(c.ultima_medicao)}).`);
    } catch (erro) {
      if (!falhouSessao(erro)) setMsgChuva(erro instanceof Error ? erro.message : "Erro ao consultar a chuva.");
    }
  };

  const cadastrar = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = ev.currentTarget;
    const corpo = {
      nome: String(new FormData(f).get("nome") ?? "").trim(),
      bairro: String(new FormData(f).get("bairro") ?? "").trim(),
      municipio: String(new FormData(f).get("municipio") ?? "").trim(),
      lat: Number(new FormData(f).get("lat")),
      lon: Number(new FormData(f).get("lon")),
    };
    try {
      await api("/api/encostas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      setMsgCad("Encosta cadastrada. Ela aparece como “sem leitura” até receber a primeira leitura.");
      f.reset();
      (f.elements.namedItem("municipio") as HTMLInputElement).value = "Recife";
      void carregar();
    } catch (erro) {
      if (!falhouSessao(erro)) setMsgCad(erro instanceof Error ? erro.message : "Erro ao cadastrar.");
    }
  };

  const avancar = async () => {
    if (!selecionadaId) { setMsgDemo("Selecione uma encosta na lista ou no mapa primeiro."); return; }
    try {
      await api(`/api/demo/avancar/${selecionadaId}`, { method: "POST" });
      setMsgDemo("Avançou 1 h de tempestade nesta encosta.");
      await carregar();
    } catch (erro) {
      if (!falhouSessao(erro)) setMsgDemo(erro instanceof Error ? erro.message : "Erro na demonstração.");
    }
  };

  const reiniciar = async () => {
    try {
      await api("/api/demo/reiniciar", { method: "POST" });
      setSelecionadaId(null);
      setMsgDemo("Dados simulados reiniciados.");
      await carregar();
    } catch (erro) {
      if (!falhouSessao(erro)) setMsgDemo(erro instanceof Error ? erro.message : "Erro ao reiniciar.");
    }
  };

  const mudarStatus = async (id: number, status: StatusVistoria) => {
    try {
      await api(`/api/vistorias/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setVistorias((lista) => lista.map((v) => (v.id === id ? { ...v, status } : v)));
      setMsgStatus("Situação atualizada.");
    } catch (erro) {
      if (!falhouSessao(erro)) setMsgStatus(erro instanceof Error ? erro.message : "Erro ao atualizar.");
    }
  };

  const escolher = (e: Encosta) => {
    setSelecionadaId(e.id);
    mapRef.current?.panTo([e.lat, e.lon]);
  };

  return (
    <div className="painel-app">
      <div className="faixa-topo">
        <span>Área do administrador · monitoramento geotécnico de encostas e barreiras</span>
        <span>Emergência: Defesa Civil 199 · Bombeiros 193</span>
      </div>
      <header className="topo">
        <div className="topo-marca">
          <img src="/logoIcone.png" alt="" className="logo" />
          <div>
            <h1>Encosta Ai</h1>
            <p>Alerta antecipado de deslizamentos · Região Metropolitana do Recife</p>
          </div>
        </div>
        <div className="topo-info">
          <span className="selo">Dados simulados</span>
          <span>{atualizado}</span>
          <button type="button" className="sair" onClick={() => void sairPainel()}>Sair</button>
        </div>
      </header>

      <section className="alerta" role="alert" aria-live="polite" hidden={emAlerta.length === 0}>
        {emAlerta.map((e) => (
          <button key={e.id} type="button" className={`alerta-item ${e.nivel}`} onClick={() => escolher(e)}>
            <span>
              <b>{`ALERTA · ${e.nome} (${e.bairro})`}</b>
              {" · ruptura estimada em "}
            </span>
            <Relogio iso={e.ruptura!.ruptura_em!} />
          </button>
        ))}
      </section>

      <section className="resumo" aria-label="Resumo por nível de risco">
        {NIVEIS.map((n) => (
          <div key={n} className={`item ${n}`}>
            <span className="num">{encostas.filter((e) => e.nivel === n).length}</span>
            <span className="rot">{ROTULOS[n]}</span>
          </div>
        ))}
      </section>

      <main className="layout">
        <div className="mapa-area">
          <div id="mapa" ref={host} aria-label="Mapa das encostas monitoradas" />
          <div className="legenda" aria-label="Legenda">
            <span><i className="ponto verde" />Verde</span>
            <span><i className="ponto amarelo" />Amarelo</span>
            <span><i className="ponto laranja" />Laranja</span>
            <span><i className="ponto vermelho" />Vermelho</span>
            <span><i className="ponto vistoria" />Vistoria</span>
          </div>
        </div>

        <aside className="lateral">
          <section>
            <h2>Encostas monitoradas</h2>
            <ul className="lista">
              {ordenadas.map((e) => (
                <li key={e.id}>
                  <button type="button" className="cartao-encosta" aria-pressed={e.id === selecionadaId} onClick={() => escolher(e)}>
                    <span className={`ponto ${e.nivel ?? ""}`} style={e.nivel ? undefined : { background: "#8a979c" }} />
                    <span className="info">
                      <div className="nome">{e.nome}</div>
                      <div className="local">{e.bairro} · {e.municipio}</div>
                      {e.ruptura?.ok && e.ruptura.ruptura_em && <Relogio iso={e.ruptura.ruptura_em} className="tempo tempo-mini" />}
                    </span>
                    {e.nivel
                      ? <span className={`selo-nivel ${e.nivel}`}>{ROTULOS[e.nivel].split(" · ")[0]} {fmt(e.confianca, 0)}%</span>
                      : <span className="local">sem leitura</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {selecionada && (
            <section className="detalhe">
              <h2>{selecionada.nome}</h2>
              <p className="local">{selecionada.bairro} · {selecionada.municipio}</p>
              <Camera key={`${selecionada.id}-${tick}`} encosta={selecionada} onMudou={() => void carregar()} onSessao={onSair} />
              {!selecionada.nivel ? <p>Esta encosta ainda não recebeu leituras.</p> : (
                <>
                  <div className={`nivel-bloco ${selecionada.nivel}`}>
                    <div>
                      <div className="nivel">{selecionada.nivel}</div>
                      <small>nível de risco</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="conf">{fmt(selecionada.confianca, 0)}%</div>
                      <small>confiança</small>
                    </div>
                  </div>
                  <div className="barra"><div style={{ width: `${Math.min(selecionada.confianca ?? 0, 100)}%` }} /></div>
                  {porLimiar(selecionada.por_limiar) && (
                    <p className="aviso-limiar">
                      Alerta ativado pelo limiar de segurança: a probabilidade de risco crítico é {fmt(selecionada.prob_vermelho, 0)}%, acima do limite de 30%.
                    </p>
                  )}
                  {selecionada.ruptura && (
                    <div className={`ruptura${selecionada.ruptura.ok ? "" : " sem"}`}>
                      {selecionada.ruptura.ok && selecionada.ruptura.ruptura_em ? (
                        <>
                          <div className="rot">Ruptura estimada em</div>
                          <Relogio iso={selecionada.ruptura.ruptura_em} />
                          {selecionada.ruptura.antecipada_min ? (
                            <p className="reduzida">Estimativa reduzida: a última leitura antecipou a ruptura em {selecionada.ruptura.antecipada_min} min.</p>
                          ) : null}
                          <p className="detalhe-r">
                            Previsão às {hora(selecionada.ruptura.ruptura_em)} · método do inverso da velocidade · ajuste {fmt((selecionada.ruptura.qualidade ?? 0) * 100, 0)}% ({selecionada.ruptura.pontos} leituras). É uma estimativa de tendência e é refeita a cada leitura.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="rot">Ruptura estimada</div>
                          <p className="detalhe-r">{selecionada.ruptura.motivo}</p>
                        </>
                      )}
                    </div>
                  )}
                  <div className="vars">
                    {CAMPOS.map(([chave, rotulo, unidade]) => (
                      <div key={chave}>
                        <span>{rotulo}</span>
                        <b>{fmt(selecionada[chave])} {unidade}</b>
                      </div>
                    ))}
                    <div>
                      <span>Lona plástica</span>
                      <b>{selecionada.tem_lona ? "Sim" : "Não"}</b>
                    </div>
                  </div>
                  <h3>Últimas leituras</h3>
                  <div className="linha-tempo">
                    {historico.map((h, i) => (
                      <div
                        key={`${h.criado_em}-${i}`}
                        className="barra-h"
                        style={{ background: CORES[h.nivel], height: `${25 + indice(h.nivel) * 25}%` }}
                        title={`${hora(h.criado_em)} · ${ROTULOS[h.nivel]} · ${fmt(h.confianca, 0)}%`}
                      />
                    ))}
                  </div>
                  {historico.length > 0 && (
                    <div className="eixo-tempo">
                      <span>{hora(historico[0].criado_em)}</span>
                      <span>{hora(historico[historico.length - 1].criado_em)}</span>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          <section aria-labelledby="titulo-vist">
            <div className="cab-vist">
              <h2 id="titulo-vist">Solicitações de vistoria {novas > 0 && <span className="contador">{novas}</span>}</h2>
              <label className="check-mapa"><input type="checkbox" checked={verVist} onChange={(e) => setVerVist(e.target.checked)} /> no mapa</label>
            </div>
            <div className="filtros" role="group" aria-label="Filtrar por situação">
              <button type="button" aria-pressed={filtro === "abertas"} onClick={() => setFiltro("abertas")}>Abertas</button>
              <button type="button" aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas</button>
            </div>
            <ul id="lista-vist" className="lista">
              {visiveis.length === 0 ? (
                <li className="dica">{filtro === "todas" ? "Nenhuma solicitação recebida ainda." : "Nenhuma solicitação aberta."}</li>
              ) : visiveis.map((v) => (
                <li key={v.id}>
                  <button type="button" className="cartao-encosta" aria-pressed={v.id === vistId} onClick={() => {
                    setVistId(v.id);
                    setMsgStatus("");
                    if (v.latitude !== null && v.longitude !== null) mapRef.current?.panTo([v.latitude, v.longitude]);
                  }}>
                    <span className="info">
                      <div className="nome">#{v.id} · {v.nome}</div>
                      <div className="local">{v.cidade} · {v.tipo} · {dataHora(v.criado_em)}{v.latitude === null ? " · sem localização no mapa" : ""}</div>
                    </span>
                    <span className={`selo-status st-${v.status}`}>{ROT_STATUS[v.status]}</span>
                  </button>
                </li>
              ))}
            </ul>
            {vistoria && (
              <section className="detalhe">
                <h2>Solicitação #{vistoria.id}</h2>
                <p className="local">Recebida em {dataHora(vistoria.criado_em)}</p>
                <div className="vars vars-1">
                  <div><span>Nome</span><b>{vistoria.nome || "–"}</b></div>
                  <div>
                    <span>Telefone</span>
                    <b>{vistoria.telefone
                      ? <a href={`tel:${vistoria.telefone.replace(/[^0-9+]/g, "")}`}>{vistoria.telefone}</a>
                      : "–"}</b>
                  </div>
                  <div><span>E-mail</span><b>{vistoria.email || "–"}</b></div>
                  <div><span>Município</span><b>{vistoria.cidade || "–"}</b></div>
                  <div><span>Tipo de local</span><b>{vistoria.tipo || "–"}</b></div>
                  <div><span>Endereço ou referência</span><b>{vistoria.endereco || "–"}</b></div>
                  <div><span>Coordenadas</span><b>{vistoria.latitude !== null && vistoria.longitude !== null ? `${fmt(vistoria.latitude, 5)}, ${fmt(vistoria.longitude, 5)}` : "não informadas"}</b></div>
                  <div><span>O que foi observado</span><b>{vistoria.descricao || "–"}</b></div>
                </div>
                <label className="rot-status">Situação{" "}
                  <select value={vistoria.status} onChange={(e) => void mudarStatus(vistoria.id, e.target.value as StatusVistoria)}>
                    {(Object.keys(ROT_STATUS) as StatusVistoria[]).map((s) => <option key={s} value={s}>{ROT_STATUS[s]}</option>)}
                  </select>
                </label>
                <p className="dica" role="status">{msgStatus}</p>
              </section>
            )}
          </section>

          <details className="painel-extra">
            <summary>Demonstração (dados simulados)</summary>
            <p className="dica">Selecione uma encosta e avance o tempo: a cada hora de chuva forte o solo acelera e a ruptura estimada é recalculada.</p>
            <div className="botoes">
              <button type="button" onClick={() => void avancar()}>Avançar 1 h de tempestade</button>
              <button type="button" className="sec" onClick={() => void reiniciar()}>Reiniciar dados</button>
            </div>
            <p className="dica" role="status">{msgDemo}</p>
          </details>

          <details className="painel-extra">
            <summary>Simular uma leitura</summary>
            <form className="form-sim" onSubmit={(ev) => void calcular(ev)}>
              {CAMPOS.map(([chave, rotulo, , min, max, step]) => (
                <label key={chave}>{rotulo} <output>{fmt(sim[chave], step < 1 ? 1 : 0)}</output>
                  <input type="range" min={min} max={max} step={step} value={sim[chave]} onChange={(e) => setSim((s) => ({ ...s, [chave]: Number(e.target.value) }))} />
                </label>
              ))}
              <label className="check">
                <input type="checkbox" checked={sim.tem_lona} onChange={(e) => setSim((s) => ({ ...s, tem_lona: e.target.checked }))} /> Lona plástica na encosta
              </label>
              <button type="button" id="btn-chuva" className="sec" onClick={() => void usarChuva()}>Usar chuva real (INMET)</button>
              <p className="dica" role="status">{msgChuva}</p>
              <button type="submit">Calcular risco</button>
            </form>
            {(resultado || msgSim) && (
              <div className="resultado-sim">
                {resultado ? (
                  <>
                    <div className={`nivel-bloco ${resultado.nivel}`}>
                      <div>
                        <div className="nivel">{resultado.nivel}</div>
                        <small>nível de risco</small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="conf">{fmt(resultado.confianca, 0)}%</div>
                        <small>confiança</small>
                      </div>
                    </div>
                    {resultado.por_limiar && (
                      <p className="aviso-limiar">Alerta ativado pelo limiar de segurança: probabilidade de risco crítico de {fmt(resultado.prob_vermelho, 0)}%.</p>
                    )}
                  </>
                ) : <p className="dica">{msgSim}</p>}
              </div>
            )}
          </details>

          <details className="painel-extra">
            <summary>Cadastrar encosta</summary>
            <form ref={formCad} className="form-cad" onSubmit={(ev) => void cadastrar(ev)}>
              <label>Nome <input name="nome" required minLength={2} maxLength={80} /></label>
              <label>Bairro <input name="bairro" required minLength={2} maxLength={80} /></label>
              <label>Município <input name="municipio" required minLength={2} maxLength={80} defaultValue="Recife" /></label>
              <p className="dica">Clique no mapa para preencher a posição.</p>
              <div className="duas">
                <label>Latitude <input name="lat" type="number" step="any" required /></label>
                <label>Longitude <input name="lon" type="number" step="any" required /></label>
              </div>
              <button type="submit">Cadastrar</button>
              <p className="dica" role="status">{msgCad}</p>
            </form>
          </details>
        </aside>
      </main>
    </div>
  );
}

export default function PainelAdmin() {
  const [estado, setEstado] = useState<"checando" | "login" | "painel">("checando");

  useEffect(() => {
    api<{ logado: boolean }>("/api/admin/eu")
      .then((d) => setEstado(d.logado ? "painel" : "login"))
      .catch(() => setEstado("login"));
  }, []);

  if (estado === "checando") {
    return <div className="painel-app pagina-login"><FundoLogin /><p className="dica">Carregando…</p></div>;
  }
  if (estado === "login") return <Login onOk={() => setEstado("painel")} />;
  return <Painel onSair={() => setEstado("login")} />;
}
