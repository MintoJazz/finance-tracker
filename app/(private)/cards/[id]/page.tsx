import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { CardProfileAdaptiveConfig } from "@/modules/account/ui/views/card-profile";

interface CardProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function CardProfilePage(props: CardProfilePageProps) {
    const params = await props.params;
    const cardId = Number(params.id);

    if (Number.isNaN(cardId) || cardId <= 0) {
        return (
            <ErrorView
                title="Identificador Inválido"
                error="O identificador do cartão informado na rota é inválido."
            />
        );
    }

    return (
        <ViewContainer
            data={{ cardId }}
            {...CardProfileAdaptiveConfig}
        />
    );
}