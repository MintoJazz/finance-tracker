import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form.types";
import type { CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";

export const walletFormFields: FormField<CreateWalletFormValues>[] = [
    {
        name: "name",
        label: "Nome da carteira",
        description: "Ex: Carteira Principal, Dinheiro, Reserva de Emergência...",
        children: (
            <Input
                placeholder="Digite o nome da carteira"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
            />
        ),
    },
];
