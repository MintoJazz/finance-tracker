import { Edit, Eye } from "lucide-react";
import type { RowAction } from "@/types/actions.types";
import type { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";

export interface RecurrenceActionContext {
    onView?: (recurrence: RecurrenceListItem) => void;
    onEdit?: (recurrence: RecurrenceListItem) => void;
}

export const RECURRENCE_ACTIONS: RowAction<
    RecurrenceListItem,
    RecurrenceActionContext
>[] = [
        {
            id: "view",
            label: "Ver detalhes",
            icon: Eye,
            onClick: (row, context) => context?.onView?.(row.original),
            hidden: (_row, context) => !context?.onView,
        },
        {
            id: "edit",
            label: "Editar",
            icon: Edit,
            onClick: (row, context) => context?.onEdit?.(row.original),
            hidden: (_row, context) => !context?.onEdit,
        },
    ];

