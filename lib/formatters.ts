import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatMoney = (valorCentavos: number | bigint): string =>  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valorCentavos) / 100);

export const formatDate = (data: Date): string => (data) && format(data, "dd'/'MM'/'yyyy", { locale: ptBR });