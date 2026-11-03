import { redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedCategoriesList } from "@/modules/categories/ui/components/archived-categories-list";

export default async function ArchivedCategoriesPage() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  return (
    <ArchivedPageLayout
      title="Categorias Arquivadas"
      description="Gerencie e recupere suas categorias e subcategorias arquivadas."
      backHref="/categories"
    >
      <ArchivedCategoriesList />
    </ArchivedPageLayout>
  );
}

