import type { Area, Risk, AreaType } from "../types";

type Row = [string, string, Risk, AreaType, number, number, number, string];

// Dados de exemplo. Substitua por uma chamada à sua API.
const rows: Row[] = [
  ["Alto da Bondade", "Olinda", "critico", "Encosta", -7.9975, -34.854, 12, "há 4 min"],
  ["Morro da Conceição", "Recife", "alto", "Encosta", -8.0165, -34.918, 9, "há 2 min"],
  ["Alto José do Pinho", "Recife", "medio", "Encosta", -8.012, -34.898, 8, "há 6 min"],
  ["Córrego do Jenipapo", "Recife", "medio", "Barreira", -8.03, -34.905, 6, "há 3 min"],
  ["Vila Brasil", "Olinda", "baixo", "Barreira", -8.005, -34.866, 5, "há 9 min"],
  ["Muribeca", "Jaboatão dos Guararapes", "alto", "Encosta", -8.135, -34.965, 11, "há 1 min"],
  ["Jardim Jordão", "Jaboatão dos Guararapes", "medio", "Barreira", -8.165, -34.94, 7, "há 5 min"],
  ["Vista Alegre", "Jaboatão dos Guararapes", "baixo", "Encosta", -8.15, -34.92, 4, "há 12 min"],
  ["Bairro Novo", "Camaragibe", "medio", "Encosta", -8.02, -34.99, 6, "há 7 min"],
  ["Tabatinga", "Camaragibe", "baixo", "Barreira", -8.01, -35.01, 3, "há 8 min"],
  ["Caetés", "São Lourenço da Mata", "alto", "Encosta", -7.995, -35.04, 10, "há 3 min"],
  ["Charneca", "São Lourenço da Mata", "baixo", "Barreira", -8.005, -35.06, 3, "há 15 min"],
  ["Ponte dos Carvalhos", "Cabo de Santo Agostinho", "medio", "Barreira", -8.28, -34.97, 5, "há 6 min"],
  ["Gaibu", "Cabo de Santo Agostinho", "baixo", "Encosta", -8.335, -34.95, 4, "há 10 min"],
];

export const AREAS: Area[] = rows.map(
  ([nome, cidade, risco, tipo, lat, lng, sensores, leitura], id) => ({
    id, nome, cidade, risco, tipo, lat, lng, sensores, leitura,
  })
);

export const RISK_META: Record<Risk, { label: string; bg: string; fill: string; hex: string }> = {
  baixo: { label: "Risco baixo", bg: "bg-risk-low", fill: "var(--color-risk-low)", hex: "#2a8f5e" },
  medio: { label: "Risco médio", bg: "bg-risk-mid", fill: "var(--color-risk-mid)", hex: "#d98a10" },
  alto: { label: "Risco alto", bg: "bg-risk-high", fill: "var(--color-risk-high)", hex: "#c8383d" },
  critico: { label: "Risco crítico", bg: "bg-risk-critical", fill: "var(--color-risk-critical)", hex: "#6e1020" },
};
