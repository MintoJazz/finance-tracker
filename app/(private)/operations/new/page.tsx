import OperationsPage from "../page"
import NewOperationModalPage from "../@modal/(.)new/page"

export interface CreateOperationDirectPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CreateOperationDirectPage(
  props: CreateOperationDirectPageProps
) {
  return (
    <>
      <OperationsPage />
      <NewOperationModalPage searchParams={props.searchParams} />
    </>
  )
}

