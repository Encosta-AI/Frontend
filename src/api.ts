export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Vazio no desenvolvimento: o Vite encaminha /api para o backend local. */
export const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${apiBase}${caminho}`, { ...opcoes, credentials: "include" });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }
  if (resposta.status === 401) throw new ApiError("É preciso entrar como administrador.", 401);
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({} as { detail?: unknown }));
    const detalhe = corpo.detail;
    const primeira = Array.isArray(detalhe) ? detalhe.find((item) => item && typeof item === "object" && "msg" in item) as { msg?: string } | undefined : undefined;
    const mensagem = typeof detalhe === "string"
      ? detalhe
      : primeira?.msg?.replace(/^Value error,\s*/, "") || "Erro ao falar com o servidor";
    throw new ApiError(mensagem, resposta.status);
  }
  return resposta.json() as Promise<T>;
}
