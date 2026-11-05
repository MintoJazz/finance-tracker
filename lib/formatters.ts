import { format,isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export const formatMoney = (valorCentavos: number | bigint): string =>  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valorCentavos) / 100);

export function toCivilDate(data: Date): Date {
  return new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 12, 0, 0);
}

export const formatDate = (data: Date | string | null | undefined): string => {
  if (!data) return "";
  if (typeof data === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    const d = new Date(data);
    return Number.isNaN(d.getTime()) ? "" : format(d, "dd'/'MM'/'yyyy", { locale: ptBR });
  }
  return format(data, "dd'/'MM'/'yyyy", { locale: ptBR });
};

export function checkDate(targetDate: Date, dateRange: DateRange): boolean {
   if (!dateRange?.from || !dateRange?.to) return false;

   return isWithinInterval(targetDate, {
     start: dateRange.from,
     end: dateRange.to
   });
}