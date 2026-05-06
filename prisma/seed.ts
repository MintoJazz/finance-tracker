import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` }),
});

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Cleanup (ordem reversa das dependências) ──────────────────────
  await prisma.movement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bucket.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Banco limpo.\n");

  // ─── Users ─────────────────────────────────────────────────────────
  const joao = await prisma.user.create({
    data: { email: "joao@email.com" },
  });

  const maria = await prisma.user.create({
    data: { email: "maria@email.com" },
  });

  console.log(`👤 Usuários criados: ${joao.email}, ${maria.email}`);

  // ─── Workspace ─────────────────────────────────────────────────────
  const workspace = await prisma.workspace.create({
    data: { name: "Casa" },
  });

  console.log(`🏠 Workspace criado: ${workspace.name}`);

  // ─── Memberships ──────────────────────────────────────────────────
  const memberJoao = await prisma.membership.create({
    data: { userId: joao.id, workspaceId: workspace.id },
  });

  const memberMaria = await prisma.membership.create({
    data: { userId: maria.id, workspaceId: workspace.id },
  });

  console.log(`🤝 Memberships criadas para João e Maria`);

  // ─── Buckets ──────────────────────────────────────────────────────
  const carteiraJoao = await prisma.bucket.create({
    data: {
      name: "Carteira João",
      type: "WALLET",
      workspaceId: workspace.id,
      memberId: memberJoao.id,
    },
  });

  const carteiraMaria = await prisma.bucket.create({
    data: {
      name: "Carteira Maria",
      type: "WALLET",
      workspaceId: workspace.id,
      memberId: memberMaria.id,
    },
  });

  const creditoJoao = await prisma.bucket.create({
    data: {
      name: "Cartão João",
      type: "CREDIT",
      workspaceId: workspace.id,
      memberId: memberJoao.id,
    },
  });

  const reservaViagem = await prisma.bucket.create({
    data: {
      name: "Reserva Viagem",
      type: "RESERVE",
      workspaceId: workspace.id,
      memberId: null, // bucket compartilhado
    },
  });

  const contaConjunta = await prisma.bucket.create({
    data: {
      name: "Conta Conjunta",
      type: "WALLET",
      workspaceId: workspace.id,
      memberId: null,
    },
  });

  console.log(
    `💰 Buckets criados: ${[carteiraJoao, carteiraMaria, creditoJoao, reservaViagem, contaConjunta].map((b) => b.name).join(", ")}`,
  );

  // ─── Helper: criar transação com movimentações ────────────────────
  type MovementInput = {
    bucketId: number;
    amount: number;
    role: "DEBIT" | "CREDIT" | "TRANSFER_DEBIT" | "TRANSFER_CREDIT";
  };

  async function createTransaction(data: {
    description: string;
    amount: number;
    date: Date;
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    status: "PROJECTED" | "PENDING" | "SETTLED" | "CANCELED";
    kind?: "DEFAULT" | "INVOICE" | "ORDER";
    movements: MovementInput[];
  }) {
    return prisma.transaction.create({
      data: {
        workspaceId: workspace.id,
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        status: data.status,
        kind: data.kind ?? "DEFAULT",
        movements: {
          create: data.movements,
        },
      },
      include: { movements: true },
    });
  }

  // ─── Transactions ─────────────────────────────────────────────────

  // 1. Despesa simples — SETTLED
  await createTransaction({
    description: "Mercado — compras da semana",
    amount: 18750, // R$ 187,50
    date: new Date("2026-04-28"),
    type: "EXPENSE",
    status: "SETTLED",
    movements: [
      { bucketId: carteiraJoao.id, amount: 18750, role: "DEBIT" },
    ],
  });

  // 2. Despesa com split — SETTLED
  await createTransaction({
    description: "Jantar no restaurante",
    amount: 15000, // R$ 150,00
    date: new Date("2026-04-30"),
    type: "EXPENSE",
    status: "SETTLED",
    movements: [
      { bucketId: carteiraJoao.id, amount: 10000, role: "DEBIT" },
      { bucketId: carteiraMaria.id, amount: 5000, role: "DEBIT" },
    ],
  });

  // 3. Receita — SETTLED
  await createTransaction({
    description: "Salário João — maio",
    amount: 520000, // R$ 5.200,00
    date: new Date("2026-05-05"),
    type: "INCOME",
    status: "SETTLED",
    movements: [
      { bucketId: carteiraJoao.id, amount: 520000, role: "CREDIT" },
    ],
  });

  // 4. Receita — SETTLED
  await createTransaction({
    description: "Salário Maria — maio",
    amount: 480000, // R$ 4.800,00
    date: new Date("2026-05-05"),
    type: "INCOME",
    status: "SETTLED",
    movements: [
      { bucketId: carteiraMaria.id, amount: 480000, role: "CREDIT" },
    ],
  });

  // 5. Transferência — SETTLED
  await createTransaction({
    description: "Aporte mensal para viagem",
    amount: 50000, // R$ 500,00
    date: new Date("2026-05-06"),
    type: "TRANSFER",
    status: "SETTLED",
    movements: [
      { bucketId: contaConjunta.id, amount: 50000, role: "TRANSFER_DEBIT" },
      { bucketId: reservaViagem.id, amount: 50000, role: "TRANSFER_CREDIT" },
    ],
  });

  // 6. Despesa no crédito — PENDING
  await createTransaction({
    description: "Assinatura streaming",
    amount: 5590, // R$ 55,90
    date: new Date("2026-05-01"),
    type: "EXPENSE",
    status: "PENDING",
    kind: "INVOICE",
    movements: [
      { bucketId: creditoJoao.id, amount: 5590, role: "DEBIT" },
    ],
  });

  // 7. Despesa futura — PROJECTED
  await createTransaction({
    description: "Aluguel — junho",
    amount: 200000, // R$ 2.000,00
    date: new Date("2026-06-01"),
    type: "EXPENSE",
    status: "PROJECTED",
    movements: [
      { bucketId: contaConjunta.id, amount: 200000, role: "DEBIT" },
    ],
  });

  // 8. Despesa cancelada — CANCELED
  await createTransaction({
    description: "Pedido cancelado — loja online",
    amount: 8990, // R$ 89,90
    date: new Date("2026-04-25"),
    type: "EXPENSE",
    status: "CANCELED",
    movements: [
      { bucketId: creditoJoao.id, amount: 8990, role: "DEBIT" },
    ],
  });

  // 9. Despesa — SETTLED (conta conjunta)
  await createTransaction({
    description: "Conta de luz — abril",
    amount: 23470, // R$ 234,70
    date: new Date("2026-04-20"),
    type: "EXPENSE",
    status: "SETTLED",
    movements: [
      { bucketId: contaConjunta.id, amount: 23470, role: "DEBIT" },
    ],
  });

  // 10. Despesa — SETTLED (crédito)
  await createTransaction({
    description: "Farmácia",
    amount: 6730, // R$ 67,30
    date: new Date("2026-05-03"),
    type: "EXPENSE",
    status: "SETTLED",
    movements: [
      { bucketId: creditoJoao.id, amount: 6730, role: "DEBIT" },
    ],
  });

  // 11. Transferência entre wallets — SETTLED
  await createTransaction({
    description: "Maria repassando pra conta conjunta",
    amount: 100000, // R$ 1.000,00
    date: new Date("2026-05-06"),
    type: "TRANSFER",
    status: "SETTLED",
    movements: [
      { bucketId: carteiraMaria.id, amount: 100000, role: "TRANSFER_DEBIT" },
      { bucketId: contaConjunta.id, amount: 100000, role: "TRANSFER_CREDIT" },
    ],
  });

  // 12. Despesa futura — PROJECTED
  await createTransaction({
    description: "IPTU — parcela 6/10",
    amount: 45000, // R$ 450,00
    date: new Date("2026-06-15"),
    type: "EXPENSE",
    status: "PROJECTED",
    movements: [
      { bucketId: contaConjunta.id, amount: 45000, role: "DEBIT" },
    ],
  });

  // ─── Resumo ───────────────────────────────────────────────────────
  const totalTransactions = await prisma.transaction.count();
  const totalMovements = await prisma.movement.count();

  console.log(`\n✅ Seed finalizado!`);
  console.log(`   📊 ${totalTransactions} transações`);
  console.log(`   📋 ${totalMovements} movimentações`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed falhou:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
