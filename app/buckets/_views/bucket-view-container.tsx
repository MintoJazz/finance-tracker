"use client"

import { useIsDesktop } from "@/hooks/use-breakpoint";
import BucketViewDesktop from "./bucket-view-desktop";
import BucketViewMoblie from "./bucket-view-mobile";
import CreateBucket from "@/features/buckets/components/create-bucket-dialog";
import UpdateBucket from "@/features/buckets/components/update-bucket-dialog";
import DeleteBucket from "@/features/buckets/components/delete-bucket-dialog";
import { BucketList, UserOption } from "@/types/database";
import { useBucketContainer } from "../hook";

interface Props {
    buckets: BucketList[]
    users: UserOption[]
}

export default function BucketViewContainer({ users, buckets }: Props) {
    const { setIsCreateOpen, actions, createProps, deleteProps, updateProps } = useBucketContainer()

    const isDesktop = useIsDesktop()

    return <div>
        {isDesktop ? <BucketViewDesktop setIsCreateOpen={setIsCreateOpen} actions={actions} buckets={buckets} /> : <BucketViewMoblie setIsCreateOpen={setIsCreateOpen} actions={actions} buckets={buckets}/>}

        <CreateBucket users={users} {...createProps} />
        <UpdateBucket {...updateProps} />
        <DeleteBucket {...deleteProps} />
    </div>
}