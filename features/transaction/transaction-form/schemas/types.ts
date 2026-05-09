import z from "zod";
import { transactionFormSchema } from "../schemas";
import { toTransferSchema } from "@/transactions/schemas";

export type ToTransferFormType = z.infer<typeof toTransferSchema>;
export type TransactionFormType = z.infer<typeof transactionFormSchema>