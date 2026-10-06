import { AdaptiveConfig } from "@/types/adaptive.types";
import { EditCardModalInput, EditCardModalProps } from "./types";
import { useEditCardModal } from "./hook";
import EditCardModalViewDesktop from "./desktop";
import EditCardModalViewMobile from "./mobile";

export const EditCardModalConfig: AdaptiveConfig<
    EditCardModalInput,
    EditCardModalProps
> = {
    views: {
        mobile: {
            hook: useEditCardModal,
            View: EditCardModalViewMobile,
        },
        desktop: {
            hook: useEditCardModal,
            View: EditCardModalViewDesktop,
        },
    },
};

export { useEditCardModal } from "./hook";
export * from "./types";