import { AdaptiveConfig } from "@/components/adaptive"
import { BucketList } from "@/types/database"
import { useBucketContainer, BucketViewProps } from "./hook"
import BucketViewDesktop from "./_views/bucket-view-desktop"
import BucketViewMoblie from "./_views/bucket-view-mobile"

export const views: AdaptiveConfig<BucketList[], BucketViewProps>["views"] = {
    desktop: {
        hook: useBucketContainer,
        View: BucketViewDesktop,
    },
    mobile: {
        hook: useBucketContainer,
        View: BucketViewMoblie,
    },
}
