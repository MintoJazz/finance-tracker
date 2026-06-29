import { findAllBuckets } from "@/features/buckets/server/queries";
import { UserProvider } from "@/features/user/context/user-options-provider";
import { findAllUserOptions } from "@/features/user/server/queries";
import BucketViewContainer from "./_views/bucket-view-container";

export default async function Page() {
    const [ users, buckets ] = await Promise.all([
        findAllUserOptions(),
        findAllBuckets()
    ])

    return <UserProvider users={users} >
        <BucketViewContainer users={users} buckets={buckets} />
    </UserProvider>
}