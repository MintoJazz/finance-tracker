import { format,isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export const formatarDinheiro = (valorCentavos: number | bigint): string =>  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valorCentavos) / 100);

export const formatarData = (data: Date): string => (data) && format(data, "dd'/'MM'/'yyyy", { locale: ptBR });

export function checkDate(targetDate: Date, dateRange: DateRange): boolean {
   if (!dateRange?.from || !dateRange?.to) return false;

   return isWithinInterval(targetDate, {
     start: dateRange.from,
     end: dateRange.to
   });
}