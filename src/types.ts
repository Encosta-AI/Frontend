export type Risk = "baixo" | "medio" | "alto" | "critico";
export type AreaType = "Encosta" | "Barreira";

export interface Area {
  id: number;
  nome: string;
  cidade: string;
  risco: Risk;
  tipo: AreaType;
  lat: number;
  lng: number;
  sensores: number;
  leitura: string;
}

export interface InspectionPrefill {
  local?: string;
  cidade?: string;
  lat?: number;
  lng?: number;
}
