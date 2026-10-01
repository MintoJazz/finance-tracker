export class SeedRegistry {
  /** email -> partyId */
  readonly partiesByEmail = new Map<string, number>();

  /** ownerEmail -> default contextId */
  readonly defaultContextByEmail = new Map<string, number>();

  /** "ownerEmail:balanceName" -> balanceId */
  readonly balancesByKey = new Map<string, number>();

  setUserContext(email: string, partyId: number, contextId: number) {
    this.partiesByEmail.set(email, partyId);
    this.defaultContextByEmail.set(email, contextId);
  }

  getContextIdOrThrow(email: string): number {
    const id = this.defaultContextByEmail.get(email);
    if (!id) throw new Error(`[SeedRegistry] Contexto não encontrado para o email: ${email}`);
    return id;
  }

  setBalance(email: string, balanceName: string, balanceId: number) {
    this.balancesByKey.set(`${email}:${balanceName}`, balanceId);
  }

  getBalanceIdOrThrow(email: string, balanceName: string): number {
    const key = `${email}:${balanceName}`;
    const id = this.balancesByKey.get(key);
    if (!id) throw new Error(`[SeedRegistry] Balance não encontrado para a chave: ${key}`);
    return id;
  }
}