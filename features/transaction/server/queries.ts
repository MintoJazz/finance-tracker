"use server"

import { prisma } from "@/lib/prisma"
import { TransactionDetails } from "../../../types/database"

export const findAllTransactions = async () => prisma.transaction.findMany({ include: {
    movements: {
        include: {
            bucket: {
                select: {
                    id: true, 
                    name: true
                }
            }
        }
    }
} }) as Promise<TransactionDetails[]>