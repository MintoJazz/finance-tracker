import { prisma } from "@/lib/prisma";
import { ICycleQueries } from "../../application/interfaces/cycle-queries.interface";
import { CyclePrismaQueries } from "../repositories/cycle-prisma.queries";
import { GetCycleDetailUseCase } from "../../application/use-cases/get-cycle-detail.usecase";

export class CycleFactory {
    private static readonly cycleQueries: ICycleQueries =
        new CyclePrismaQueries(prisma);

    public static readonly makeGetCycleDetailUseCase = () =>
        new GetCycleDetailUseCase(this.cycleQueries);
}