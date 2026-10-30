import { ViewContainer } from "@/components/adaptive";
import { CreateCardModalConfig } from "@/modules/cards/ui/views/create-card-modal";
import { getDeviceViewport } from "@/lib/device";

export default async function CreateCardModalPage() {
    const initialViewport = await getDeviceViewport();
    return <ViewContainer initialViewport={initialViewport} data={{}} {...CreateCardModalConfig} />;
}
