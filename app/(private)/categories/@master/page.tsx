import { redirect } from "next/navigation";
import { isValid, parse } from "date-fns";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getDeviceViewport } from "@/lib/device";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { getCategoriesTreeAction } from "@/modules/categories/ui/actions/get-categories-tree.action";
import { CategoriesMasterConfig } from "@/modules/categories/ui/views/categories-master";

interface CategoriesMasterPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function CategoriesMasterPage(props: CategoriesMasterPageProps) {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;

  let from: Date | undefined;
  let to: Date | undefined;

  if (searchParams?.from) {
    const parsedFrom = parse(searchParams.from, "yyyy-MM-dd", new Date());
    if (isValid(parsedFrom)) from = parsedFrom;
  }

  if (searchParams?.to) {
    const parsedTo = parse(searchParams.to, "yyyy-MM-dd", new Date());
    if (isValid(parsedTo)) to = parsedTo;
  }

  const result = await getCategoriesTreeAction({ from, to });
  if (!result.success || !result.data) {
    return (
      <ErrorView
        title="Erro ao carregar categorias"
        error={result.error ?? "Não foi possível carregar as categorias."}
      />
    );
  }

  const initialViewport = await getDeviceViewport();

  return (
    <ViewContainer
      initialViewport={initialViewport}
      data={result.data}
      {...CategoriesMasterConfig}
    />
  );
}
