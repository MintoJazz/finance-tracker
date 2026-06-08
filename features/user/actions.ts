"use server"

import { prisma } from "@/lib/prisma";

export const findAllUserOptions = async() => prisma.user.findMany({ select: {
    id: true,
    name: true
} })