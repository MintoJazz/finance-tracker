import ContractsPage from "../page";
import CreateContractModalPage from "../@modal/(.)create/page";

interface Props {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CreateContractDirectPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <>
      <ContractsPage searchParams={Promise.resolve(searchParams)} />
      <CreateContractModalPage />
    </>
  );
}
