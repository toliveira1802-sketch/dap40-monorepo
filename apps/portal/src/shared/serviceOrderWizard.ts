export type WizardStep = "cliente" | "veiculo" | "servico" | "confirmacao";

export const CAMPAIGN_ORIGINS = [
  "Cliente Espontâneo / Passante",
  "Google / Busca Online",
  "Instagram / Redes Sociais",
  "Indicação de Cliente",
  "Contrato de Frota",
  "Seguradora / Sinistro",
] as const;

export const SERVICE_TYPES = [
  "Revisão Preventiva / Periódica",
  "Manutenção Corretiva / Diagnóstico",
  "Freios e Suspensão",
  "Troca de Óleo e Filtros",
  "Motor e Injeção Eletrônica",
  "Câmbio e Embreagem",
  "Ar Condicionado e Higienização",
  "Elétrica e Bateria",
  "Alinhamento e Balanceamento",
] as const;
