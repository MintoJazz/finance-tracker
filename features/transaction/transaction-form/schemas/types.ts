import z from "zod";
import { transactionFormSchema } from "../schemas";
import { SCHEMA_REGISTRY } from "./schema-registry";

export type ToTransferFormType = z.infer<typeof SCHEMA_REGISTRY.toTransfer>;
export type TransactionFormType = z.infer<typeof transactionFormSchema>