import type { AdaptiveConfig } from "@/types/adaptive.types";
import type { EditRecurrenceModalInput, EditRecurrenceModalProps } from "./types";
import { useEditRecurrenceModal } from "./hook";
import EditRecurrenceModalViewDesktop from "./desktop";
import EditRecurrenceModalViewMobile from "./mobile";

export const EditRecurrenceModalConfig: AdaptiveConfig<
    EditRecurrenceModalInput,
    EditRecurrenceModalProps
> = {
    views: {
        mobile: {
            hook: useEditRecurrenceModal,
            View: EditRecurrenceModalViewMobile,
        },
        desktop: {
            hook: useEditRecurrenceModal,
            View: EditRecurrenceModalViewDesktop,
        },
    },
};

export { useEditRecurrenceModal } from "./hook";
export * from "./types";
