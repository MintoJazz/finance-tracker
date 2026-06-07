import { BucketType, TransactionType, TransactionStatus, MovementRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

async function main() {
  // --- Usuários ---
  const joao = await prisma.user.create({
    data: { name: 'João Silva' },
  })

  const maria = await prisma.user.create({
    data: { name: 'Maria Silva' },
  })

  // --- Buckets ---
  const joaoWallet = await prisma.bucket.create({
    data: { userId: joao.id, name: 'Carteira', type: BucketType.WALLET },
  })

  const joaoCredit = await prisma.bucket.create({
    data: { userId: joao.id, name: 'Nubank', type: BucketType.CREDIT },
  })

  const joaoReserve = await prisma.bucket.create({
    data: { userId: joao.id, name: 'Reserva de Emergência', type: BucketType.RESERVE },
  })

  const mariaWallet = await prisma.bucket.create({
    data: { userId: maria.id, name: 'Carteira', type: BucketType.WALLET },
  })

  const mariaCredit = await prisma.bucket.create({
    data: { userId: maria.id, name: 'Inter', type: BucketType.CREDIT },
  })

  // ==========================================
  // --- Transações do João ---
  // ==========================================

  // 1. Receita: salário na carteira (SETTLED)
  const salario = await prisma.transaction.create({
    data: {
      description: 'Salário',
      amount: 500000, // Valor de face: R$ 5.000,00
      date: new Date('2024-03-05'),
      type: TransactionType.INCOME,
      status: TransactionStatus.SETTLED,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: joaoWallet.id,
      transactionId: salario.id,
      amount: 500000, // Entrou dinheiro (+ positivo)
      role: MovementRole.CREDIT,
    },
  })

  // 2. Despesa: mercado no crédito (SETTLED)
  const mercado = await prisma.transaction.create({
    data: {
      description: 'Mercado',
      amount: 35090, // Valor de face da nota fiscal
      date: new Date('2024-03-10'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.SETTLED,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: joaoCredit.id,
      transactionId: mercado.id,
      amount: -35090, // Saiu dinheiro (- negativo)
      role: MovementRole.DEBIT,
    },
  })

  // 3. Transferência: carteira → reserva (SETTLED)
  const transferencia = await prisma.transaction.create({
    data: {
      description: 'Aporte reserva de emergência',
      amount: 100000,
      date: new Date('2024-03-06'),
      type: TransactionType.TRANSFER,
      status: TransactionStatus.SETTLED,
    },
  })

  await prisma.movement.createMany({
    data: [
      {
        bucketId: joaoWallet.id,
        transactionId: transferencia.id,
        amount: -100000, // Saiu da Carteira (- negativo)
        role: MovementRole.TRANSFER_DEBIT,
      },
      {
        bucketId: joaoReserve.id,
        transactionId: transferencia.id,
        amount: 100000, // Entrou na Reserva (+ positivo)
        role: MovementRole.TRANSFER_CREDIT,
      },
    ],
  })

  // 4. Conta projetada: aluguel (PROJECTED)
  const aluguel = await prisma.transaction.create({
    data: {
      description: 'Aluguel',
      amount: 150000,
      date: new Date('2024-04-05'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.PROJECTED,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: joaoWallet.id,
      transactionId: aluguel.id,
      amount: -150000, // Vai sair dinheiro (- negativo)
      role: MovementRole.DEBIT,
    },
  })

  // 5. Conta pendente: fatura Nubank (PENDING)
  const fatura = await prisma.transaction.create({
    data: {
      description: 'Fatura Nubank Março',
      amount: 89700,
      date: new Date('2024-04-10'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.PENDING,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: joaoCredit.id,
      transactionId: fatura.id,
      amount: -89700, // Vai sair dinheiro (- negativo)
      role: MovementRole.DEBIT,
    },
  })

  // ==========================================
  // --- Transações da Maria ---
  // ==========================================

  // 6. Receita: salário (SETTLED)
  const salariaMaria = await prisma.transaction.create({
    data: {
      description: 'Salário',
      amount: 380000,
      date: new Date('2024-03-05'),
      type: TransactionType.INCOME,
      status: TransactionStatus.SETTLED,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: mariaWallet.id,
      transactionId: salariaMaria.id,
      amount: 380000, // Entrou dinheiro (+ positivo)
      role: MovementRole.CREDIT,
    },
  })

  // 7. Despesa: farmácia no crédito (SETTLED)
  const farmacia = await prisma.transaction.create({
    data: {
      description: 'Farmácia',
      amount: 8750,
      date: new Date('2024-03-12'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.SETTLED,
    },
  })

  await prisma.movement.create({
    data: {
      bucketId: mariaCredit.id,
      transactionId: farmacia.id,
      amount: -8750, // Saiu dinheiro (- negativo)
      role: MovementRole.DEBIT,
    },
  })

  console.log('Seed concluído com sucesso!')
  console.log(`Usuários: João (id ${joao.id}), Maria (id ${maria.id})`)
  console.log(`Buckets João: Carteira, Nubank, Reserva`)
  console.log(`Buckets Maria: Carteira, Inter`)
  console.log(`Transações e Movimentações com sinais ajustados inseridas.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())