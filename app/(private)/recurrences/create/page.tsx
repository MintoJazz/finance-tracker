import RecurrencesPage from "../page";
import CreateRecurrenceModalPage from "../@modal/(.)create/page";

export default async function CreateRecurrenceDirectPage() {
    return (
        <>
            <RecurrencesPage />
            <CreateRecurrenceModalPage />
        </>
    );
}
