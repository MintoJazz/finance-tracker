import type { AdaptiveConfig } from "@/types/adaptive.types"
import type { MasterDetailData, MasterDetailViewProps } from "./types"
import MasterDetailDesktop from "./desktop"
import { useDesktopMasterDetail } from "./desktop/hook"
import MasterDetailMobile from "./mobile"
import { useMobileMasterDetail } from "./mobile/hook"

export const MasterDetailConfig: AdaptiveConfig<MasterDetailData, MasterDetailViewProps> = {
    views: {
        mobile: { hook: useMobileMasterDetail, View: MasterDetailMobile },
        desktop: { hook: useDesktopMasterDetail, View: MasterDetailDesktop },
    },
}

export { useMasterDetail } from "./context"
export { OpenMasterButton, CloseMasterButton, MasterLink } from "./master-toggle"
export type { MasterDetailData, MasterDetailContextValue } from "./types"
