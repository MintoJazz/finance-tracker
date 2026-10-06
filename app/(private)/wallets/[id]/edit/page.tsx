import EditWalletModalPage from "../../@modal/(.)[id]/edit/page";
import WalletProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditWalletDirectPage(props: Props) {
    return (
        <>
            <WalletProfilePage params={props.params} />
            <EditWalletModalPage params={props.params} />
        </>
    );
}