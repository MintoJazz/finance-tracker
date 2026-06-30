import { UserProvider } from "@/features/user/context/user-options-provider";
import BucketViewContainer from "./_views/bucket-view-container";
import { findAllUserOptions } from "@/server/user/find-all-user-options";
import { findAllBuckets } from "@/server/bucket/find-all-buckets";

export default async function Page() {
    const [ users, buckets ] = await Promise.all([
        findAllUserOptions(),
        findAllBuckets()
    ])

    return <UserProvider users={users} >
        <BucketViewContainer users={users} buckets={buckets} />
    </UserProvider>
}