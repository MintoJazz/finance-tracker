import AdjustCardLimitModalPage from "../@modal/(.)adjust-limit/page";
import CardProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustCardLimitDirectPage(props: Props) {
    return (
        <>
            <CardProfilePage params={props.params} />
            <AdjustCardLimitModalPage params={props.params} />
        </>
    );
}
