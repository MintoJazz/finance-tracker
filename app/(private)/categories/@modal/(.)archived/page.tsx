import { redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { ArchivedSheet } from "@/components/archived/archived-sheet";
import { ArchivedCategoriesList } from "@/modules/categories/ui/components/archived-categories-list";

export default async function ArchivedCategoriesModal() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  return (
    <ArchivedSheet
      title="Categorias Arquivadas"
      description="Gerencie e recupere suas categorias e subcategorias arquivadas."
    >
      <ArchivedCategoriesList />
    </ArchivedSheet>
  );
}

