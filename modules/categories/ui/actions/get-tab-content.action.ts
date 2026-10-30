"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";

export interface CategoryTabActionParams {
  categoryId?: number | null;
  from?: Date;
  to?: Date;
}

export interface TabBasicData {
  title: string;
  scope: string;
  categoryId?: number | null;
  loadedAt: string;
}

export async function getOverviewIndicatorsAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Indicadores Gerais",
    scope: "overview-indicators",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

export async function getRootIndicatorsAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Indicadores da Categoria Raiz",
    scope: "root-indicators",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

export async function getRootEntriesAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Lançamentos Agregados (Somente Leitura)",
    scope: "root-entries",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

export async function getChildrenAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Subcategorias",
    scope: "children",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

export async function getLeafIndicatorsAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Indicadores da Categoria",
    scope: "leaf-indicators",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

export async function getLeafEntriesAction(
  params?: CategoryTabActionParams
): Promise<Result<TabBasicData>> {
  const session = await SessionHandler.getSession();
  if (!session) return failure("Não autenticado");

  return success({
    title: "Lançamentos da Categoria",
    scope: "leaf-entries",
    categoryId: params?.categoryId,
    loadedAt: new Date().toISOString(),
  });
}

