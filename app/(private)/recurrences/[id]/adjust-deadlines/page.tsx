import AdjustRecurrenceDeadlinesModalPage from "../../@modal/(...)recurrences/[id]/adjust-deadlines/page";
import RecurrenceProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustRecurrenceDeadlinesDirectPage(props: Props) {
    return (
        <>
            <RecurrenceProfilePage params={props.params} />
            <AdjustRecurrenceDeadlinesModalPage params={props.params} />
        </>
    );
}
