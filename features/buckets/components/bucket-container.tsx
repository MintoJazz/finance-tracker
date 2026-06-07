import { BucketList } from "@/types/database";
import { BUCKET_TYPE_THEMES } from "../themes/bucket-type";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { formatarDinheiro } from "@/lib/formatters";

interface Props {
    buckets: BucketList[]
}

export default function BucketContainer({ buckets }: Props) {
    return <div className="flex flex-col gap-2">
        {buckets.map(bucket => {
            const Icon = BUCKET_TYPE_THEMES[bucket.type]
            return <Item variant="outline" key={bucket.id} asChild>
                <a href={`/buckets/${bucket.id}`}>
                    <ItemMedia>
                        <Icon />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{bucket.name}</ItemTitle>
                        <ItemDescription>{bucket.user.name}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <p className="text-xs font-black tracking-tight">{formatarDinheiro(bucket.balance)}</p>
                    </ItemActions>
                </a>
            </Item>
        })}
    </div>
}