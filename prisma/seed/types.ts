export interface SeedUser {
  name: string;
  email: string;
  birthDate?: string; // YYYY-MM-DD
  phone?: string;
  contextName: string; // nome do contexto padrão (o usuário é OWNER)
}

export interface SeedData {
  defaultPassword: string;
  users: SeedUser[];
}