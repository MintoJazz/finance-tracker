import {
  ArrowRightIcon,
  AudioLinesIcon,
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  FolderIcon,
  GalleryVerticalEndIcon,
  LandmarkIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  TerminalIcon,
  Trash2Icon,
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
    label: "Teams",
    options: [
      {
        id: "acme-inc",
        title: "Acme Inc",
        subtitle: "Enterprise",
        logo: GalleryVerticalEndIcon,
      },
      {
        id: "acme-corp",
        title: "Acme Corp.",
        subtitle: "Startup",
        logo: AudioLinesIcon,
      },
      {
        id: "evil-corp",
        title: "Evil Corp.",
        subtitle: "Free",
        logo: TerminalIcon,
      },
    ] satisfies SwitcherOption[],
    footerAction: {
      label: "Add team",
      icon: PlusIcon,
    } satisfies SidebarAction,
  },

  navMain: {
    label: "Navegação",
    items: [
      {
        title: "Meios de Pagamento",
        url: "#",
        icon: LandmarkIcon,
        isActive: true,
        items: [
          { title: "Carteiras", url: "/" },
          { title: "Cartões", url: "/cards" },
          { title: "Reservas", url: "#" },
        ],
      },
      // {
      //   title: "Models",
      //   url: "#",
      //   icon: BotIcon,
      //   items: [
      //     { title: "Genesis", url: "#" },
      //     { title: "Explorer", url: "#" },
      //     { title: "Quantum", url: "#" },
      //   ],
      // },
      // {
      //   title: "Documentation",
      //   url: "#",
      //   icon: BookOpenIcon,
      //   items: [
      //     { title: "Introduction", url: "#" },
      //     { title: "Get Started", url: "#" },
      //     { title: "Tutorials", url: "#" },
      //     { title: "Changelog", url: "#" },
      //   ],
      // },
      // {
      //   title: "Settings",
      //   url: "#",
      //   icon: Settings2Icon,
      //   items: [
      //     { title: "General", url: "#" },
      //     { title: "Team", url: "#" },
      //     { title: "Billing", url: "#" },
      //     { title: "Limits", url: "#" },
      //   ],
      // },
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