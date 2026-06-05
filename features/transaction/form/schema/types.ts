import z from "zod";
import { transactionFormSchema } from "./transaction-schema";

export type TransactionFormType = z.infer<typeof transactionFormSchema>
