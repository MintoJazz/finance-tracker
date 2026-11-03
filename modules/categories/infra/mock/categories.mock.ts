import type {
  CategoryItem,
  CreateCategoryFormValues,
} from "@/modules/categories/models/category.schema";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/modules/categories/models/category.schema";
import type { Page, PageRequest } from "@/types/pagination.types";

interface MockRawCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
  parentId: number | null;
  children: {
    id: number;
    name: string;
    icon: string;
    color: string;
    amount: number;
  }[];
}

export const MOCK_FULL_CATEGORIES: MockRawCategory[] = [
  {
    id: 1,
    name: "Alimentação",
    icon: "UtensilsCrossed",
    color: "orange",
    amount: 184200,
    parentId: null,
    children: [
      { id: 11, name: "Mercado", icon: "ShoppingCart", color: "amber", amount: 112000 },
      { id: 12, name: "Restaurantes", icon: "Coffee", color: "orange", amount: 52200 },
      { id: 13, name: "Lanches & Delivery", icon: "Pizza", color: "red", amount: 20000 },
    ],
  },
  {
    id: 2,
    name: "Transporte",
    icon: "Car",
    color: "sky",
    amount: 64000,
    parentId: null,
    children: [
      { id: 21, name: "Combustível", icon: "Fuel", color: "sky", amount: 45000 },
      { id: 22, name: "Transporte Público", icon: "Bus", color: "blue", amount: 12000 },
      { id: 23, name: "Aplicativos (Uber/99)", icon: "Smartphone", color: "indigo", amount: 7000 },
    ],
  },
  {
    id: 3,
    name: "Moradia",
    icon: "Home",
    color: "violet",
    amount: 120000,
    parentId: null,
    children: [
      { id: 31, name: "Aluguel & Condomínio", icon: "Building", color: "purple", amount: 95000 },
      { id: 32, name: "Contas & Energia", icon: "Zap", color: "amber", amount: 18000 },
      { id: 33, name: "Manutenção & Reformas", icon: "Wrench", color: "slate", amount: 7000 },
    ],
  },
  {
    id: 4,
    name: "Lazer",
    icon: "Smile",
    color: "emerald",
    amount: 52800,
    parentId: null,
    children: [
      { id: 41, name: "Streaming", icon: "Tv", color: "rose", amount: 12800 },
      { id: 42, name: "Passeios & Viagens", icon: "Ticket", color: "emerald", amount: 40000 },
    ],
  },
  {
    id: 5,
    name: "Saúde & Bem-estar",
    icon: "HeartPulse",
    color: "rose",
    amount: 84000,
    parentId: null,
    children: [
      { id: 51, name: "Farmácia", icon: "Pill", color: "red", amount: 29000 },
      { id: 52, name: "Consultas & Exames", icon: "Stethoscope", color: "cyan", amount: 35000 },
      { id: 53, name: "Academia & Esportes", icon: "Dumbbell", color: "emerald", amount: 20000 },
    ],
  },
  {
    id: 6,
    name: "Educação",
    icon: "GraduationCap",
    color: "indigo",
    amount: 45000,
    parentId: null,
    children: [
      { id: 61, name: "Cursos & Certificações", icon: "Laptop", color: "blue", amount: 35000 },
      { id: 62, name: "Livros & Material", icon: "BookOpen", color: "amber", amount: 10000 },
    ],
  },
  {
    id: 7,
    name: "Vestuário & Compras",
    icon: "Shirt",
    color: "pink",
    amount: 32000,
    parentId: null,
    children: [
      { id: 71, name: "Roupas & Calçados", icon: "ShoppingBag", color: "fuchsia", amount: 24000 },
      { id: 72, name: "Eletrônicos & Acessórios", icon: "Watch", color: "slate", amount: 8000 },
    ],
  },
  {
    id: 8,
    name: "Investimentos & Poupança",
    icon: "TrendingUp",
    color: "green",
    amount: 250000,
    parentId: null,
    children: [
      { id: 81, name: "Renda Fixa & Tesouro", icon: "ShieldCheck", color: "emerald", amount: 150000 },
      { id: 82, name: "Ações & FIIs", icon: "LineChart", color: "green", amount: 100000 },
    ],
  },
  {
    id: 9,
    name: "Serviços Financeiros",
    icon: "Landmark",
    color: "blue",
    amount: 15000,
    parentId: null,
    children: [
      { id: 91, name: "Tarifas Bancárias", icon: "CreditCard", color: "slate", amount: 5000 },
      { id: 92, name: "Juros & Empréstimos", icon: "Percent", color: "red", amount: 10000 },
    ],
  },
  {
    id: 10,
    name: "Doações & Presentes",
    icon: "Gift",
    color: "amber",
    amount: 22000,
    parentId: null,
    children: [
      { id: 101, name: "Presentes de Aniversário", icon: "PartyPopper", color: "yellow", amount: 15000 },
      { id: 102, name: "Doações & Caridade", icon: "Heart", color: "rose", amount: 7000 },
    ],
  },
  {
    id: 11,
    name: "Pets",
    icon: "Dog",
    color: "orange",
    amount: 38000,
    parentId: null,
    children: [
      { id: 111, name: "Ração & Petiscos", icon: "Bone", color: "amber", amount: 23000 },
      { id: 112, name: "Veterinário & Vacinas", icon: "Syringe", color: "cyan", amount: 15000 },
    ],
  },
  {
    id: 12,
    name: "Cuidados Pessoais",
    icon: "Sparkles",
    color: "purple",
    amount: 19000,
    parentId: null,
    children: [
      { id: 121, name: "Salão & Barbearia", icon: "Scissors", color: "violet", amount: 12000 },
      { id: 122, name: "Cosméticos & Higiene", icon: "Droplets", color: "blue", amount: 7000 },
    ],
  },
  {
    id: 13,
    name: "Trabalho & Negócios",
    icon: "Briefcase",
    color: "slate",
    amount: 48000,
    parentId: null,
    children: [
      { id: 131, name: "Ferramentas & Softwares", icon: "Code", color: "sky", amount: 33000 },
      { id: 132, name: "Coworking & Escritório", icon: "Building2", color: "gray", amount: 15000 },
    ],
  },
  {
    id: 14,
    name: "Outros Gastos",
    icon: "HelpCircle",
    color: "gray",
    amount: 11000,
    parentId: null,
    children: [],
  },
];

export class CategoriesMockService {
  /**
   * Retorna todas as categorias em formato de árvore completa para consultas globais.
   */
  static getFullTree(): CategoryItem[] {
    return MOCK_FULL_CATEGORIES.map((raw) => ({
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      color: raw.color,
      amount: raw.amount,
      parentId: raw.parentId,
      childrenCount: raw.children.length,
      children: raw.children.map((sub) => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
        color: sub.color,
        amount: sub.amount,
        parentId: raw.id,
        childrenCount: 0,
        children: [],
      })),
    }));
  }

  /**
   * Localiza qualquer categoria (pai ou filha) pelo ID.
   */
  static findCategoryById(id: number): {
    category: CategoryItem;
    parent: CategoryItem | null;
  } | null {
    for (const raw of MOCK_FULL_CATEGORIES) {
      if (raw.id === id) {
        return {
          category: {
            id: raw.id,
            name: raw.name,
            icon: raw.icon,
            color: raw.color,
            amount: raw.amount,
            parentId: null,
            childrenCount: raw.children.length,
            children: [],
          },
          parent: null,
        };
      }

      const sub = raw.children.find((c) => c.id === id);
      if (sub) {
        return {
          category: {
            id: sub.id,
            name: sub.name,
            icon: sub.icon,
            color: sub.color,
            amount: sub.amount,
            parentId: raw.id,
            childrenCount: 0,
            children: [],
          },
          parent: {
            id: raw.id,
            name: raw.name,
            icon: raw.icon,
            color: raw.color,
            amount: raw.amount,
            parentId: null,
            childrenCount: raw.children.length,
            children: [],
          },
        };
      }
    }
    return null;
  }

  /**
   * Retorna página de categorias-pai com `children: []` e `childrenCount: N`.
   */
  static listParentCategories(params?: {
    search?: string;
    pageRequest?: PageRequest;
  }): Page<CategoryItem> {
    const page = params?.pageRequest?.page ?? 1;
    const pageSize = params?.pageRequest?.pageSize ?? 6;

    let roots = MOCK_FULL_CATEGORIES.map((raw) => ({
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      color: raw.color,
      amount: raw.amount,
      parentId: null,
      childrenCount: raw.children.length,
      children: [],
    }));

    if (params?.search) {
      const term = params.search.toLowerCase();
      roots = roots.filter((r) => {
        const raw = MOCK_FULL_CATEGORIES.find((c) => c.id === r.id);
        const matchesParent = r.name.toLowerCase().includes(term);
        const matchesChild = raw?.children.some((c) =>
          c.name.toLowerCase().includes(term)
        );
        return matchesParent || Boolean(matchesChild);
      });
    }

    const total = roots.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedItems = roots.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedItems,
      total,
      pageIndex: safePage - 1,
      pageSize,
      pageCount,
    };
  }

  /**
   * Retorna subcategorias de uma categoria pai.
   */
  static listCategoryChildren(parentId: number): CategoryItem[] {
    const raw = MOCK_FULL_CATEGORIES.find((c) => c.id === parentId);
    if (!raw) return [];

    return raw.children.map((sub) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
      color: sub.color,
      amount: sub.amount,
      parentId: raw.id,
      childrenCount: 0,
      children: [],
    }));
  }

  /**
   * Retorna o total consolidado das categorias pai.
   */
  static getTotalAmount(): number {
    return MOCK_FULL_CATEGORIES.reduce((acc, cat) => acc + cat.amount, 0);
  }

  /**
   * Cria uma nova categoria raiz ou subcategoria em memória.
   */
  static createCategory(input: CreateCategoryFormValues): CategoryItem {
    const allIds: number[] = [];
    for (const root of MOCK_FULL_CATEGORIES) {
      allIds.push(root.id);
      for (const child of root.children) {
        allIds.push(child.id);
      }
    }
    const nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

    const icon = input.icon || DEFAULT_CATEGORY_ICON;
    const color = input.color || DEFAULT_CATEGORY_COLOR;
    const name = input.name.trim();

    if (input.parentId) {
      const parentRaw = MOCK_FULL_CATEGORIES.find(
        (c) => c.id === input.parentId
      );
      if (!parentRaw) {
        throw new Error("Categoria pai não encontrada.");
      }

      const newSub = {
        id: nextId,
        name,
        icon,
        color,
        amount: 0,
      };

      parentRaw.children.push(newSub);

      return {
        id: newSub.id,
        name: newSub.name,
        icon: newSub.icon,
        color: newSub.color,
        appearance: { icon: newSub.icon, color: newSub.color },
        amount: 0,
        parentId: parentRaw.id,
        childrenCount: 0,
        children: [],
      };
    }

    const newRoot: MockRawCategory = {
      id: nextId,
      name,
      icon,
      color,
      amount: 0,
      parentId: null,
      children: [],
    };

    MOCK_FULL_CATEGORIES.unshift(newRoot);

    return {
      id: newRoot.id,
      name: newRoot.name,
      icon: newRoot.icon,
      color: newRoot.color,
      appearance: { icon: newRoot.icon, color: newRoot.color },
      amount: 0,
      parentId: null,
      childrenCount: 0,
      children: [],
    };
  }
}

