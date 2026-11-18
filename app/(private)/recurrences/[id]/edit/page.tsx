import EditRecurrenceModalPage from "../../@modal/(...)recurrences/[id]/edit/page";
import RecurrenceProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditRecurrenceDirectPage(props: Props) {
    return (
        <>
            <RecurrenceProfilePage params={props.params} />
            <EditRecurrenceModalPage params={props.params} />
        </>
    );
}
