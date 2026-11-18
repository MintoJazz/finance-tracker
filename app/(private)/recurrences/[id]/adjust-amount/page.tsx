import AdjustRecurrenceAmountModalPage from "../../@modal/(...)recurrences/[id]/adjust-amount/page";
import RecurrenceProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustRecurrenceAmountDirectPage(props: Props) {
    return (
        <>
            <RecurrenceProfilePage params={props.params} />
            <AdjustRecurrenceAmountModalPage params={props.params} />
        </>
    );
}
