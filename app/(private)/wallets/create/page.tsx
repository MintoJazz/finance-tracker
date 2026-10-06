import WalletsPage from "../page";
import CreateWalletModalPage from "../@modal/(.)create/page";
import { PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";

interface Props {
    searchParams: Promise<PageRequest & BaseFilter>;
}

export default async function CreateWalletDirectPage(props: Props) {
    return (
        <>
            <WalletsPage searchParams={props.searchParams} />
            <CreateWalletModalPage />
        </>
    );
}
