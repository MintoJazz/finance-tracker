import { prisma } from "../../../lib/prisma";

interface ViewRow {
  entryId: number;
  contextId: number;
  kind: string;
  categoryBalanceId: number | null;
  creditBalanceId: number | null;
}

interface ScenarioCheck {
  scenario: string;
  entryDescription: string;
  contextName: string;
  expectedKind: string;
  expectedCatOrCreditName?: string;
  actualKind: string;
  actualCatOrCreditName?: string;
  status: "MATCH" | "DIVERGENCE_KNOWN" | "UNEXPECTED_DIFF";
  divergenceReason?: string;
}

async function runCheck() {
  const args = process.argv.slice(2);
  const runExplain = args.includes("--explain");

  console.log("================================================================================");
  console.log("🔍 VALIDAÇÃO DE CONSISTÊNCIA: ÁRVORE DE BALANCES & vw_entry_category");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 0. Validação Estrutural da Árvore de Balances e Subcategorias
  // ---------------------------------------------------------------------------
  const deepCategories = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
    SELECT c.id, c.name
    FROM "Balance" c
    JOIN "Balance" p ON p.id = c."parentId"
    WHERE c."balanceType" = 'CATEGORY'
      AND p."balanceType" = 'CATEGORY'
      AND p."parentId" IS NOT NULL;
  `;

  const movementsOnRootCategory = await prisma.$queryRaw<
    Array<{ movementId: number; entryDescription: string; categoryName: string }>
  >`
    SELECT m.id AS "movementId", e.description AS "entryDescription", b.name AS "categoryName"
    FROM "Movement" m
    JOIN "Balance" b ON b.id = m."balanceId"
    JOIN "Entry" e ON e.id = m."entryId"
    WHERE b."balanceType" = 'CATEGORY'
      AND b."parentId" IS NULL;
  `;

  if (deepCategories.length > 0) {
    console.error("❌ ERRO ESTRUTURAL: Existem subcategorias com mais de 1 nível de profundidade:", deepCategories);
    process.exitCode = 1;
  } else {
    console.log("✅ Regra 1 Nível de Subcategorias: Nenhuma categoria excede 2 níveis (Pai -> Subcategoria).");
  }

  if (movementsOnRootCategory.length > 0) {
    console.error("❌ ERRO ESTRUTURAL: Existem entries apontando para categorias-pai em vez de subcategorias:", movementsOnRootCategory);
    process.exitCode = 1;
  } else {
    console.log("✅ Regra de Movimentos Folha: 100% dos movimentos em categorias apontam para subcategorias.\n");
  }

  // 1. Estatística Global da View
  const distribution = await prisma.$queryRaw<Array<{ kind: string; count: bigint }>>`
    SELECT kind, COUNT(*) AS count
    FROM vw_entry_category
    GROUP BY kind
    ORDER BY count DESC;
  `;

  console.log("📊 Distribuição Global de 'kind' em vw_entry_category:");
  console.table(
    distribution.map((d) => ({
      kind: d.kind,
      total: Number(d.count),
    }))
  );
  console.log();

  async function getViewRow(entryId: number, contextId: number): Promise<ViewRow | null> {
    const rows = await prisma.$queryRaw<ViewRow[]>`
      SELECT "entryId", "contextId", kind, "categoryBalanceId", "creditBalanceId"
      FROM vw_entry_category
      WHERE "entryId" = ${entryId} AND "contextId" = ${contextId}
      LIMIT 1;
    `;
    return rows[0] || null;
  }

  async function getBalanceName(balanceId: number | null): Promise<string | undefined> {
    if (!balanceId) return undefined;
    const b = await prisma.balance.findUnique({
      where: { id: balanceId },
      select: { name: true },
    });
    return b?.name;
  }

  const anaContext = await prisma.financialContext.findFirst({ where: { name: "Finanças da Ana" } });
  const brunoContext = await prisma.financialContext.findFirst({ where: { name: "Finanças do Bruno" } });
  const carlaContext = await prisma.financialContext.findFirst({ where: { name: "Finanças da Carla" } });
  const diegoContext = await prisma.financialContext.findFirst({ where: { name: "Finanças do Diego" } });
  const eduardaContext = await prisma.financialContext.findFirst({ where: { name: "Finanças da Eduarda" } });
  const familyContext = await prisma.financialContext.findFirst({ where: { name: "Casa Ana & Bruno" } });

  if (!anaContext) {
    throw new Error("Contexto da Ana não encontrado! Execute a seed primeiro.");
  }

  const results: ScenarioCheck[] = [];

  // Cenário 1: Despesa Direta Comum (Subcategoria Supermercado & Feira)
  const directPaoAcucar = await prisma.entry.findFirst({
    where: { description: "Supermercado Pão de Açúcar" },
  });
  if (directPaoAcucar) {
    const row = await getViewRow(directPaoAcucar.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "1. Despesa Direta Única",
      entryDescription: directPaoAcucar.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Supermercado & Feira",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "category" && catName === "Supermercado & Feira" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 2: Receita Direta Comum (Subcategoria Salário Mensal CLT)
  const directSalario = await prisma.entry.findFirst({
    where: { description: { contains: "Salário Mensal - Tech Corp (Agosto)" } },
  });
  if (directSalario) {
    const row = await getViewRow(directSalario.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "2. Receita Direta Única",
      entryDescription: directSalario.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Salário Mensal CLT",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "category" && catName === "Salário Mensal CLT" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 3: Despesa Split em Carteira (Multiple)
  const splitCarteira = await prisma.entry.findFirst({
    where: { description: { contains: "Mercado & Pet Shop Express (Split)" } },
  });
  if (splitCarteira) {
    const row = await getViewRow(splitCarteira.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "3. Split na Carteira",
      entryDescription: splitCarteira.description,
      contextName: "Ana",
      expectedKind: "multiple",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 4: Despesa Split no Cartão de Crédito (Multiple)
  const splitCartao = await prisma.entry.findFirst({
    where: { description: { contains: "Empório Gourmet - Vinhos & Queijos (Split Cartão)" } },
  });
  if (splitCartao) {
    const row = await getViewRow(splitCartao.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "4. Split no Cartão",
      entryDescription: splitCartao.description,
      contextName: "Ana",
      expectedKind: "multiple",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 5: Estorno no Cartão de Crédito (REVERSAL)
  const reversalCartao = await prisma.entry.findFirst({
    where: { description: { contains: "Estorno Ingresso Show" } },
  });
  if (reversalCartao) {
    const row = await getViewRow(reversalCartao.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "5. Estorno no Cartão (REVERSAL)",
      entryDescription: reversalCartao.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Cinema, Shows & Eventos",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "category" && catName === "Cinema, Shows & Eventos" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 6: Pagamento de Fatura do Cartão (SETTLEMENT de saldo CREDIT)
  const faturaAgosto = await prisma.entry.findFirst({
    where: { description: { contains: "Pagamento de Fatura Nubank Ultravioleta (Agosto)" } },
  });
  if (faturaAgosto) {
    const row = await getViewRow(faturaAgosto.id, anaContext.id);
    const creditName = await getBalanceName(row?.creditBalanceId ?? null);
    results.push({
      scenario: "6. Pagamento Fatura Cartão",
      entryDescription: faturaAgosto.description,
      contextName: "Ana",
      expectedKind: "credit-settlement",
      expectedCatOrCreditName: "Nubank Ultravioleta Mastercard Black",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: creditName,
      status:
        row?.kind === "credit-settlement" && creditName?.includes("Ultravioleta")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 7: Provisão de Contrato (ACCRUAL)
  const accrualAluguel = await prisma.entry.findFirst({
    where: { description: { contains: "Provisão Aluguel Apartamento (08/2026)" } },
  });
  if (accrualAluguel) {
    const row = await getViewRow(accrualAluguel.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "7. Provisão Contrato (ACCRUAL)",
      entryDescription: accrualAluguel.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Aluguel & Encargos",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "category" && catName === "Aluguel & Encargos" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 8: Quitação de Contrato com Ciclo Casado (SETTLEMENT)
  const settlementAluguel = await prisma.entry.findFirst({
    where: { description: { contains: "Aluguel Apartamento (Agosto)" } },
  });
  if (settlementAluguel) {
    const row = await getViewRow(settlementAluguel.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "8. Quitação Contrato (SETTLEMENT)",
      entryDescription: settlementAluguel.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Aluguel & Encargos",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "category" && catName === "Aluguel & Encargos" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 9: Contrato com Multicategorias no Ciclo (Academia: Academia & Personal + Cinema, Shows & Eventos)
  const settlementAcademia = await prisma.entry.findFirst({
    where: { description: { contains: "Pagamento Academia Smart Fit (Agosto)" } },
  });
  if (settlementAcademia) {
    const row = await getViewRow(settlementAcademia.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "9. Quitação Contrato Multicategorias",
      entryDescription: settlementAcademia.description,
      contextName: "Ana",
      expectedKind: "multiple",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 10: Cobrança Bilateral - Abertura Raiz (CLAIM_OPENING)
  const claimOpenBilateral = await prisma.entry.findFirst({
    where: { description: { contains: "Cobrança Almoço Restaurante (Ana -> Diego)" } },
  });
  if (claimOpenBilateral) {
    const rowAna = await getViewRow(claimOpenBilateral.id, anaContext.id);
    const catAna = await getBalanceName(rowAna?.categoryBalanceId ?? null);
    results.push({
      scenario: "10a. Cobrança Raiz (Ctx Credor)",
      entryDescription: claimOpenBilateral.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Restaurantes & Bistrôs",
      actualKind: rowAna?.kind || "none",
      actualCatOrCreditName: catAna,
      status: rowAna?.kind === "category" && catAna?.includes("Restaurantes") ? "MATCH" : "UNEXPECTED_DIFF",
    });

    if (diegoContext) {
      const rowDiego = await getViewRow(claimOpenBilateral.id, diegoContext.id);
      const catDiego = await getBalanceName(rowDiego?.categoryBalanceId ?? null);
      results.push({
        scenario: "10b. Cobrança Raiz Aceita (Ctx Devedor)",
        entryDescription: claimOpenBilateral.description,
        contextName: "Diego",
        expectedKind: "category",
        expectedCatOrCreditName: "Restaurantes & Bares",
        actualKind: rowDiego?.kind || "none",
        actualCatOrCreditName: catDiego,
        status: rowDiego?.kind === "category" && catDiego?.includes("Restaurantes") ? "MATCH" : "UNEXPECTED_DIFF",
      });
    }
  }

  // Cenário 10c: Cobrança Pendente de Aceite
  const claimOpenPending = await prisma.entry.findFirst({
    where: { description: { contains: "Cobrança Café Compartilhado (Ana -> Eduarda)" } },
  });
  if (claimOpenPending && eduardaContext) {
    const rowEduarda = await getViewRow(claimOpenPending.id, eduardaContext.id);
    results.push({
      scenario: "10c. Cobrança Pendente (Ctx Devedor)",
      entryDescription: claimOpenPending.description,
      contextName: "Eduarda",
      expectedKind: "none",
      actualKind: rowEduarda?.kind || "none",
      status: rowEduarda?.kind === "none" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // Cenário 14: Cascata - Recebimento com Passagem Intermediária (CLAIM_RECEIPT)
  const claimReceiveCascata = await prisma.entry.findFirst({
    where: { description: { contains: "Recebimento Pix Ingresso Festival de Carla" } },
  });
  if (claimReceiveCascata) {
    const rowAna = await getViewRow(claimReceiveCascata.id, anaContext.id);
    const catAna = await getBalanceName(rowAna?.categoryBalanceId ?? null);
    results.push({
      scenario: "14a. Cascata Passagem (Ctx Intermediário)",
      entryDescription: claimReceiveCascata.description,
      contextName: "Ana",
      expectedKind: "pass-through",
      expectedCatOrCreditName: "Cinema, Shows & Eventos",
      actualKind: rowAna?.kind || "none",
      actualCatOrCreditName: catAna,
      status: rowAna?.kind === "pass-through" && catAna?.includes("Shows") ? "MATCH" : "UNEXPECTED_DIFF",
    });

    if (brunoContext) {
      const rowBruno = await getViewRow(claimReceiveCascata.id, brunoContext.id);
      const catBruno = await getBalanceName(rowBruno?.categoryBalanceId ?? null);
      results.push({
        scenario: "14b. Cascata Alívio (Ctx Credor Raiz)",
        entryDescription: claimReceiveCascata.description,
        contextName: "Bruno",
        expectedKind: "category",
        expectedCatOrCreditName: "Shows, Cinema & Eventos",
        actualKind: rowBruno?.kind || "none",
        actualCatOrCreditName: catBruno,
        status: rowBruno?.kind === "category" && catBruno?.includes("Shows") ? "MATCH" : "UNEXPECTED_DIFF",
      });
    }

    if (carlaContext) {
      const rowCarla = await getViewRow(claimReceiveCascata.id, carlaContext.id);
      const catCarla = await getBalanceName(rowCarla?.categoryBalanceId ?? null);
      results.push({
        scenario: "14c. Cascata Ônus (Ctx Devedor Filho)",
        entryDescription: claimReceiveCascata.description,
        contextName: "Carla",
        expectedKind: "category",
        expectedCatOrCreditName: "Shows, Cinema & Eventos",
        actualKind: rowCarla?.kind || "none",
        actualCatOrCreditName: catCarla,
        status: rowCarla?.kind === "category" && catCarla?.includes("Shows") ? "MATCH" : "UNEXPECTED_DIFF",
      });
    }
  }

  // Cenário 15 (Novo): Rateio de Obrigação de Grupo (Casa Ana & Bruno -> Ana)
  const claimGroupSplit = await prisma.entry.findFirst({
    where: { description: { contains: "Rateio Condomínio Setembro (Casa -> Ana 50%)" } },
  });
  if (claimGroupSplit && familyContext) {
    const rowFamily = await getViewRow(claimGroupSplit.id, familyContext.id);
    const catFamily = await getBalanceName(rowFamily?.categoryBalanceId ?? null);
    results.push({
      scenario: "15. Rateio Obrigação Grupo (Ctx Grupo)",
      entryDescription: claimGroupSplit.description,
      contextName: "Casa Ana & Bruno",
      expectedKind: "category",
      expectedCatOrCreditName: "Condomínio",
      actualKind: rowFamily?.kind || "none",
      actualCatOrCreditName: catFamily,
      status: rowFamily?.kind === "category" && catFamily === "Condomínio" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  console.log("📋 Tabela Comparativa de Cenários (Esperado de Negócio vs Obtido da View):");
  console.table(
    results.map((r) => ({
      Cenário: r.scenario,
      Contexto: r.contextName,
      "Kind Esperado": r.expectedKind,
      "Kind Obtido": r.actualKind,
      "Subcategoria/Crédito Obtido": r.actualCatOrCreditName || "-",
      Status: r.status,
    }))
  );

  const unexpected = results.filter((r) => r.status === "UNEXPECTED_DIFF");
  if (unexpected.length > 0) {
    console.error("\n❌ ERRO: Divergências Inesperadas Detectadas:");
    unexpected.forEach((u) => {
      console.error(`  - [${u.scenario}]: Esperado '${u.expectedKind}', obtido '${u.actualKind}' (${u.actualCatOrCreditName})`);
    });
    process.exitCode = 1;
  } else {
    console.log("\n✅ Todos os cenários e árvores de subcategorias/repasses estão 100% consistentes!");
  }

  if (runExplain) {
    const nubankWallet = await prisma.balance.findFirst({
      where: { name: "Conta Nubank", contextId: anaContext.id },
    });
    if (!nubankWallet) return;

    const explainQuery = `
      EXPLAIN (ANALYZE, BUFFERS, COSTS, TIMING, VERBOSE)
      SELECT 
          m.id AS "movementId",
          m."balanceId",
          m.amount,
          m.direction,
          e.id AS "entryId",
          e.description,
          e."dueDate",
          e.type AS "entryType",
          vc.kind,
          vc."categoryBalanceId",
          vc."creditBalanceId",
          cat.name AS "categoryName",
          parent_cat.name AS "parentCategoryName"
      FROM "Movement" m
      JOIN "Entry" e ON e.id = m."entryId"
      JOIN "Balance" b ON b.id = m."balanceId"
      LEFT JOIN vw_entry_category vc ON vc."entryId" = e.id AND vc."contextId" = b."contextId"
      LEFT JOIN "Balance" cat ON cat.id = vc."categoryBalanceId"
      LEFT JOIN "Balance" parent_cat ON parent_cat.id = cat."parentId"
      WHERE m."balanceId" = ${nubankWallet.id}
        AND e."dueDate" >= '2026-08-01T00:00:00Z'::timestamptz
        AND e."dueDate" <= '2026-09-30T23:59:59Z'::timestamptz
      ORDER BY e."dueDate" DESC, m.id DESC;
    `;
    const explainRows = await prisma.$queryRawUnsafe<Array<{ "QUERY PLAN": string }>>(explainQuery);
    console.log(explainRows.map((r) => r["QUERY PLAN"]).join("\n"));
  }
}

runCheck()
  .catch((e) => {
    console.error("Erro na verificação:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });