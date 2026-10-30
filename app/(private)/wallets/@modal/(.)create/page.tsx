import { ViewContainer } from "@/components/adaptive";
import { CreateWalletModalConfig } from "@/modules/wallets/ui/views/create-wallet-modal";
import { getDeviceViewport } from "@/lib/device";

export default async function CreateWalletModalPage() {
    const initialViewport = await getDeviceViewport();
    return <ViewContainer initialViewport={initialViewport} data={{}} {...CreateWalletModalConfig} />;
}
