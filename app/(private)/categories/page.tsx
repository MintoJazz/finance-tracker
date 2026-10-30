import { redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getDeviceViewport } from "@/lib/device";
import { CategoryDetailView } from "@/modules/categories/ui/views/category-detail";

interface CategoriesPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    tab?: string;
  }>;
}

export default async function CategoriesPage(props: CategoriesPageProps) {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const initialViewport = await getDeviceViewport();

  return (
    <CategoryDetailView
      id={null}
      searchParams={searchParams}
      initialViewport={initialViewport}
    />
  );
}
