import { findAllBuckets } from "@/server/bucket/find-all-buckets";
import { ViewContainer } from "@/components/adaptive";
import { views } from "./config";

export default async function Page() {
    const buckets = await findAllBuckets()

    return <ViewContainer data={buckets} views={views} />
}