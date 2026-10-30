import { redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getDeviceViewport } from "@/lib/device";
import { CategoryDetailView } from "@/modules/categories/ui/views/category-detail";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    from?: string;
    to?: string;
    tab?: string;
  }>;
}

export default async function CategoryDetailPage(props: CategoryDetailPageProps) {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const initialViewport = await getDeviceViewport();

  return (
    <CategoryDetailView
      id={id}
      searchParams={searchParams}
      initialViewport={initialViewport}
    />
  );
}
