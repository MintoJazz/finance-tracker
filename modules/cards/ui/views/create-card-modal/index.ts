import { AdaptiveConfig } from "@/types/adaptive.types";
import { CreateCardModalInput, CreateCardModalProps } from "./types";
import { useCreateCardModal } from "./hook";
import CreateCardModalViewDesktop from "./desktop";
import CreateCardModalViewMobile from "./mobile";

export const CreateCardModalConfig: AdaptiveConfig<
    CreateCardModalInput,
    CreateCardModalProps
> = {
    views: {
        mobile: {
            hook: useCreateCardModal,
            View: CreateCardModalViewMobile,
        },
        desktop: {
            hook: useCreateCardModal,
            View: CreateCardModalViewDesktop,
        },
    },
};

export { useCreateCardModal } from "./hook";
export * from "./types";