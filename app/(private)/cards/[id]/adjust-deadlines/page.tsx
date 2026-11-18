import AdjustCardDeadlinesModalPage from "../@modal/(.)adjust-deadlines/page";
import CardProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustCardDeadlinesDirectPage(props: Props) {
    return (
        <>
            <CardProfilePage params={props.params} />
            <AdjustCardDeadlinesModalPage params={props.params} />
        </>
    );
}
