import EditCardModalPage from "../../@modal/(.)[id]/edit/page";
import CardProfilePage from "../page";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCardDirectPage(props: Props) {
    return (
        <>
            <CardProfilePage params={props.params} />
            <EditCardModalPage params={props.params} />
        </>
    );
}