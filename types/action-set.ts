import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ComponentProps } from "react";

export interface ActionSet<T> extends ComponentProps<typeof DropdownMenuItem>{
    onAction: (target: T) => void
}