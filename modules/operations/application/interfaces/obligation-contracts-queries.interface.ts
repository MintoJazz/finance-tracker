export interface GetObligationContractsParams {
  nature: "PAY" | "RECEIVE"
  search?: string
  cursor?: string
  limit?: number
}

export interface ObligationContractItem {
  agreementId: number
  balanceId: number
  name: string
  balanceType: "CREDIT" | "PAYABLE" | "RECEIVABLE"
  subtitle: string
  pendingAmount: number
  overdueCount: number
  nextDueDate: string | null
}

export interface IObligationContractsQueries {
  getObligationContracts(
    contextId: number,
    params: GetObligationContractsParams
  ): Promise<ObligationContractItem[]>
}

