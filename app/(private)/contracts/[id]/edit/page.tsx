import ContractsPage from "../../page";
import EditContractModalPage from "../../@modal/(.)[id]/edit/page";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    type?: string;
    showArchived?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function EditContractDirectPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <>
      <ContractsPage searchParams={Promise.resolve(searchParams)} />
      <EditContractModalPage params={Promise.resolve(params)} />
    </>
  );
}
