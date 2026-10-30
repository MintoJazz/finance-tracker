"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, success, type Result } from "@/types/result.types";
import type {
  CategoryTreeDTO,
  CategoryTreeFilter,
} from "@/modules/categories/models/category.schema";

const MOCK_CATEGORIES_TREE: CategoryTreeDTO = {
  period: {
    from: new Date(2026, 9, 1), // 01/10/2026
    to: new Date(2026, 9, 31), // 31/10/2026
  },
  totalAmount: 421000, // R$ 4.210,00
  items: [
    {
      id: 1,
      name: "Alimentação",
      icon: "UtensilsCrossed",
      color: "orange",
      amount: 184200, // R$ 1.842,00
      parentId: null,
      children: [
        {
          id: 11,
          name: "Mercado",
          icon: "ShoppingCart",
          color: "amber",
          amount: 112000, // R$ 1.120,00
          parentId: 1,
        },
        {
          id: 12,
          name: "Restaurantes",
          icon: "Coffee",
          color: "orange",
          amount: 72200, // R$ 722,00
          parentId: 1,
        },
      ],
    },
    {
      id: 2,
      name: "Transporte",
      icon: "Car",
      color: "sky",
      amount: 64000, // R$ 640,00
      parentId: null,
      children: [
        {
          id: 21,
          name: "Combustível",
          icon: "Fuel",
          color: "sky",
          amount: 45000, // R$ 450,00
          parentId: 2,
        },
        {
          id: 22,
          name: "Transporte Público",
          icon: "Bus",
          color: "blue",
          amount: 19000, // R$ 190,00
          parentId: 2,
        },
      ],
    },
    {
      id: 3,
      name: "Moradia",
      icon: "Home",
      color: "violet",
      amount: 120000, // R$ 1.200,00
      parentId: null,
      children: [
        {
          id: 31,
          name: "Aluguel",
          icon: "Building",
          color: "purple",
          amount: 95000, // R$ 950,00
          parentId: 3,
        },
        {
          id: 32,
          name: "Contas & Energia",
          icon: "Zap",
          color: "amber",
          amount: 25000, // R$ 250,00
          parentId: 3,
        },
      ],
    },
    {
      id: 4,
      name: "Lazer",
      icon: "Smile",
      color: "emerald",
      amount: 52800, // R$ 528,00
      parentId: null,
      children: [
        {
          id: 41,
          name: "Streaming",
          icon: "Tv",
          color: "rose",
          amount: 12800, // R$ 128,00
          parentId: 4,
        },
        {
          id: 42,
          name: "Passeios",
          icon: "Ticket",
          color: "emerald",
          amount: 40000, // R$ 400,00
          parentId: 4,
        },
      ],
    },
  ],
};

export async function getCategoriesTreeAction(
  filter?: CategoryTreeFilter
): Promise<Result<CategoryTreeDTO>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const period = {
    from: filter?.from ?? MOCK_CATEGORIES_TREE.period.from,
    to: filter?.to ?? MOCK_CATEGORIES_TREE.period.to,
  };

  let items = MOCK_CATEGORIES_TREE.items;
  if (filter?.search) {
    const term = filter.search.toLowerCase();
    items = items.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }

  return success({
    ...MOCK_CATEGORIES_TREE,
    period,
    items,
  });
}
