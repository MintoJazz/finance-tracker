"use client"

import { BucketList } from "@/types/database";
import { useBucketFeatures } from "../hooks/use-bucket-features";
import DeleteBucket from "./delete-bucket";
import { DataTable } from "@/components/ui/data-table";
import { mobileBucketColums } from "./bucket-mobile-columns";
import { useRouter } from "next/navigation";

interface Props {
    buckets: BucketList[]
}

export default function BucketContainer({ buckets }: Props) {
    const { rows, deleteBucketProps } = useBucketFeatures(buckets)
    const router = useRouter()
    
    return <div className="flex flex-col gap-2">

        <DataTable data={rows} columns={mobileBucketColums} showHeader={false}
            onRowClick={(row) => {
            const idDaLinha = row.original.bucket.id; 
            router.push(`/detalhes/${idDaLinha}`);
        }}/>

        <DeleteBucket {...deleteBucketProps} />
    </div>
}