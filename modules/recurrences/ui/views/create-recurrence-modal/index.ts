import type { AdaptiveConfig } from "@/types/adaptive.types";
import type {
    CreateRecurrenceModalInput,
    CreateRecurrenceModalProps,
} from "./types";
import { useCreateRecurrenceModal } from "./hook";
import CreateRecurrenceModalViewDesktop from "./desktop";
import CreateRecurrenceModalViewMobile from "./mobile";

export const CreateRecurrenceModalConfig: AdaptiveConfig<
    CreateRecurrenceModalInput,
    CreateRecurrenceModalProps
> = {
    views: {
        mobile: {
            hook: useCreateRecurrenceModal,
            View: CreateRecurrenceModalViewMobile,
        },
        desktop: {
            hook: useCreateRecurrenceModal,
            View: CreateRecurrenceModalViewDesktop,
        },
    },
};

export { useCreateRecurrenceModal } from "./hook";
export * from "./types";
