import CardsPage from "../page";
import CreateCardModalPage from "../@modal/(.)create/page";
import { PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";

interface Props {
    searchParams: Promise<PageRequest & BaseFilter>;
}

export default async function CreateCardDirectPage(props: Props) {
    return (
        <>
            <CardsPage searchParams={props.searchParams} />
            <CreateCardModalPage />
        </>
    );
}