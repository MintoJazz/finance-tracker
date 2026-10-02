import type { SystemSeedFactory } from "../core/system.factory";

export async function seedOtherUsersScenario(factory: SystemSeedFactory) {
  console.log("👥 Populando cenários de Bruno, Carla, Diego e Eduarda...");

  // ==========================================
  // Bruno
  // ==========================================
  const bruno = await factory.createUser({
    name: "Bruno Lima",
    email: "bruno@teste.com",
    birthDate: "1990-07-25",
    phone: "53991110002",
    defaultContextName: "Finanças do Bruno",
  });

  await bruno.space.addWallets([
    { name: "Banco Inter", initialBalance: { amount: 320000, date: "2026-09-02T11:00:00Z" } },
    { name: "PicPay", initialBalance: { amount: 45000 } },
  ]);

  await bruno.space.addCreditCards([
    {
      name: "Inter Mastercard Black",
      limit: 2000000,
      closingDay: 10,
      dueDay: 17,
      initialExpenses: [{ description: "Aluguel Carro Localiza", amount: 450000, date: "2026-09-10T14:00:00Z" }],
    },
    {
      name: "Nubank Platinum Mastercard",
      limit: 1200000,
      closingDay: 25,
      dueDay: 2,
      initialExpenses: [{ description: "Assinatura Spotify", amount: 3490, date: "2026-09-12T10:00:00Z" }],
    },
  ]);

  // ==========================================
  // Carla
  // ==========================================
  const carla = await factory.createUser({
    name: "Carla Mendes",
    email: "carla@teste.com",
    birthDate: "1988-11-02",
    phone: "53991110003",
    defaultContextName: "Finanças da Carla",
  });

  await carla.space.addWallets([
    { name: "Conta Santander", initialBalance: { amount: 610000, date: "2026-09-12T16:20:00Z" } },
    { name: "C6 Bank", initialBalance: { amount: 125000, date: "2026-09-15T08:00:00Z" } },
    { name: "Dinheiro em Espécie" },
  ]);

  await carla.space.addCreditCards([
    {
      name: "Santander SX Visa Gold",
      limit: 800000,
      closingDay: 15,
      dueDay: 22,
      initialExpenses: [{ description: "Livros Livraria Cultura", amount: 150000, date: "2026-09-14T11:30:00Z" }],
    },
    {
      name: "C6 Mastercard Standard",
      limit: 500000,
      closingDay: 5,
      dueDay: 12,
    },
  ]);

  // ==========================================
  // Diego
  // ==========================================
  const diego = await factory.createUser({
    name: "Diego Ferreira",
    email: "diego@teste.com",
    birthDate: "1997-01-30",
    phone: "53991110004",
    defaultContextName: "Finanças do Diego",
  });

  await diego.space.addWallets([
    { name: "Conta Bradesco", initialBalance: { amount: 185000, date: "2026-09-18T13:45:00Z" } },
    { name: "Mercado Pago", initialBalance: { amount: 78000, date: "2026-09-20T19:00:00Z" } },
  ]);

  await diego.space.addCreditCard({
    name: "Bradesco Like Visa",
    limit: 1500000,
    closingDay: 20,
    dueDay: 28,
    initialExpenses: [{ description: "Ingressos Cinema & Show", amount: 380000, date: "2026-09-18T20:00:00Z" }],
  });

  // ==========================================
  // Eduarda
  // ==========================================
  const eduarda = await factory.createUser({
    name: "Eduarda Costa",
    email: "eduarda@teste.com",
    birthDate: "2000-09-18",
    phone: "53991110005",
    defaultContextName: "Finanças da Eduarda",
  });

  await eduarda.space.addWallets([
    { name: "Conta Nubank", initialBalance: { amount: 95000, date: "2026-09-22T10:10:00Z" } },
    { name: "Caixa Econômica", initialBalance: { amount: 210000, date: "2026-09-25T15:00:00Z" } },
  ]);

  return { bruno, carla, diego, eduarda };
}