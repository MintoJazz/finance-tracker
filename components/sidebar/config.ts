import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellIcon,
  Calendar,
  CalendarClock,
  CreditCardIcon,
  FolderIcon,
  Handshake,
  Landmark,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import type {
  NavCollapsibleItem,
  NavOptionItem,
  SidebarAction,
  SidebarUserProfile,
  SwitcherOption,
} from "./types"

export const sidebarConfig = {
  switcher: {
    label: "Espaços",
    options: [] as SwitcherOption[],
    footerAction: {
      label: "Novo Espaço",
      icon: PlusIcon,
    } satisfies SidebarAction,
  },

  navMain: {
    label: "Navegação",
    items: [
      {
        title: "Contas",
        url: "#",
        icon: Landmark,
        isActive: true,
        items: [
          { title: "Carteiras", url: "/wallets" },
          { title: "Cartões", url: "/cards" },
          { title: "Reservas", url: "#" },
        ],
      },
      {
        title: "Planejamento",
        url: "#",
        icon: CalendarClock,
        isActive: true,
        items: [
          { title: "Compromissos", url: "#" },
          { title: "Contratos", url: "/contracts" },
          { title: "Categorias", url: "/categories" }
        ],
      },
    ] satisfies NavCollapsibleItem[],
  },

  projects: {
    label: "Solicitações Recentes",
    items: [
      // {
      //   title: "Design Engineering",
      //   url: "#",
      //   icon: FrameIcon,
      // },
      // {
      //   title: "Sales & Marketing",
      //   url: "#",
      //   icon: PieChartIcon,
      // },
      // {
      //   title: "Travel",
      //   url: "#",
      //   icon: MapIcon,
      // },
    ] satisfies NavOptionItem[],
    itemActions: [
      {
        id: "view",
        label: "View Project",
        icon: FolderIcon,
      },
      {
        id: "share",
        label: "Share Project",
        icon: ArrowRightIcon,
      },
      {
        id: "delete",
        label: "Delete Project",
        icon: Trash2Icon,
        variant: "destructive",
        separatorBefore: true,
      },
    ] satisfies SidebarAction[],
    moreAction: {
      label: "More",
    },
  },

  navSecondary: {
    items: [
      { title: "Meus Compromissos", url: "/commitments", icon: Calendar },
      { title: "Solicitações", url: "#", icon: Handshake },
      { title: "Amigos", url: "#", icon: UsersIcon },
    ] satisfies NavOptionItem[],
  },
  user: {
    profile: {
      name: "shadcn",
      subtitle: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    } satisfies SidebarUserProfile,
    actionGroups: [
      [
        {
          id: "upgrade",
          label: "Upgrade to Pro",
          icon: SparklesIcon,
        },
      ],
      [
        {
          id: "account",
          label: "Account",
          icon: BadgeCheckIcon,
        },
        {
          id: "billing",
          label: "Billing",
          icon: CreditCardIcon,
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: BellIcon,
        },
      ],
      [
        {
          id: "logout",
          label: "Log out",
          icon: LogOutIcon,
        },
      ],
    ] satisfies SidebarAction[][],
  },
}