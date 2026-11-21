import InstallmentsPage from "../page";
import CreateInstallmentModalPage from "../@modal/(.)create/page";

export default async function CreateInstallmentDirectPage() {
    return (
        <>
            <InstallmentsPage />
            <CreateInstallmentModalPage />
        </>
    );
}
