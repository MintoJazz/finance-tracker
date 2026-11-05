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
  console.log("🔍 VALIDAÇÃO DE CONSISTÊNCIA: vw_entry_category & PLANO DE EXECUÇÃO");
  console.log("================================================================================\n");

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

  // Helper para buscar a view por (entryId, contextId)
  async function getViewRow(entryId: number, contextId: number): Promise<ViewRow | null> {
    const rows = await prisma.$queryRaw<ViewRow[]>`
      SELECT "entryId", "contextId", kind, "categoryBalanceId", "creditBalanceId"
      FROM vw_entry_category
      WHERE "entryId" = ${entryId} AND "contextId" = ${contextId}
      LIMIT 1;
    `;
    return rows[0] || null;
  }

  // Helper para buscar nome do balance
  async function getBalanceName(balanceId: number | null): Promise<string | undefined> {
    if (!balanceId) return undefined;
    const b = await prisma.balance.findUnique({
      where: { id: balanceId },
      select: { name: true },
    });
    return b?.name;
  }

  // Buscar contextos base
  const anaContext = await prisma.financialContext.findFirst({
    where: { name: "Finanças da Ana" },
  });
  const brunoContext = await prisma.financialContext.findFirst({
    where: { name: "Finanças do Bruno" },
  });
  const carlaContext = await prisma.financialContext.findFirst({
    where: { name: "Finanças da Carla" },
  });
  const diegoContext = await prisma.financialContext.findFirst({
    where: { name: "Finanças do Diego" },
  });
  const eduardaContext = await prisma.financialContext.findFirst({
    where: { name: "Finanças da Eduarda" },
  });

  if (!anaContext) {
    throw new Error("Contexto da Ana não encontrado! Execute a seed primeiro.");
  }

  const results: ScenarioCheck[] = [];

  // ---------------------------------------------------------------------------
  // Cenário 1: Despesa Direta Comum (Single Category)
  // ---------------------------------------------------------------------------
  const directPaoAcucar = await prisma.entry.findFirst({
    where: { description: { contains: "Supermercado Pão de Açúcar" } },
  });
  if (directPaoAcucar) {
    const row = await getViewRow(directPaoAcucar.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "1. Despesa Direta Única",
      entryDescription: directPaoAcucar.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Alimentação & Mercado",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status:
        row?.kind === "category" && catName === "Alimentação & Mercado"
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 2: Receita Direta Comum (Single Category)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: "Salário & Renda",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status:
        row?.kind === "category" && catName === "Salário & Renda"
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 3: Despesa Split em Carteira (Multiple)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: undefined,
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 4: Despesa Split no Cartão de Crédito (Multiple)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: undefined,
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 5: Estorno no Cartão de Crédito (REVERSAL)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: "Lazer & Assinaturas",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status:
        row?.kind === "category" && catName === "Lazer & Assinaturas"
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 6: Pagamento de Fatura do Cartão (SETTLEMENT de saldo CREDIT)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: "Cartão Nubank Ultravioleta",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: creditName,
      status:
        row?.kind === "credit-settlement" && creditName?.includes("Ultravioleta")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 7: Provisão de Contrato (ACCRUAL)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: "Moradia & Contas",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status:
        row?.kind === "category" && catName === "Moradia & Contas"
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 8: Quitação de Contrato com Ciclo Casado (SETTLEMENT)
  // ---------------------------------------------------------------------------
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
      expectedCatOrCreditName: "Moradia & Contas",
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status:
        row?.kind === "category" && catName === "Moradia & Contas"
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 9: Contrato com Multicategorias no Ciclo (Academia: Saúde + Lazer)
  // ---------------------------------------------------------------------------
  const settlementAcademia = await prisma.entry.findFirst({
    where: { description: { contains: "Academia Smart Fit (Agosto)" } },
  });
  if (settlementAcademia) {
    const row = await getViewRow(settlementAcademia.id, anaContext.id);
    const catName = await getBalanceName(row?.categoryBalanceId ?? null);
    results.push({
      scenario: "9. Quitação Contrato Multicategorias",
      entryDescription: settlementAcademia.description,
      contextName: "Ana",
      expectedKind: "multiple",
      expectedCatOrCreditName: undefined,
      actualKind: row?.kind || "none",
      actualCatOrCreditName: catName,
      status: row?.kind === "multiple" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 10: Cobrança Bilateral - Abertura Raiz (CLAIM_OPENING)
  // ---------------------------------------------------------------------------
  const claimOpenBilateral = await prisma.entry.findFirst({
    where: { description: { contains: "Cobrança Almoço Restaurante (Ana -> Diego)" } },
  });
  if (claimOpenBilateral) {
    // Contexto Ana (Credora): herda categoria raiz do receivable.parentId
    const rowAna = await getViewRow(claimOpenBilateral.id, anaContext.id);
    const catAna = await getBalanceName(rowAna?.categoryBalanceId ?? null);
    results.push({
      scenario: "10a. Cobrança Raiz (Ctx Credor)",
      entryDescription: claimOpenBilateral.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Alimentação & Mercado",
      actualKind: rowAna?.kind || "none",
      actualCatOrCreditName: catAna,
      status:
        rowAna?.kind === "category" && catAna?.includes("Alimentação")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });

    // Contexto Diego (Devedor): herda categoria após aceite via payable.parentId
    if (diegoContext) {
      const rowDiego = await getViewRow(claimOpenBilateral.id, diegoContext.id);
      const catDiego = await getBalanceName(rowDiego?.categoryBalanceId ?? null);
      results.push({
        scenario: "10b. Cobrança Raiz Aceita (Ctx Devedor)",
        entryDescription: claimOpenBilateral.description,
        contextName: "Diego",
        expectedKind: "category",
        expectedCatOrCreditName: "Alimentação & Mercado",
        actualKind: rowDiego?.kind || "none",
        actualCatOrCreditName: catDiego,
        status:
          rowDiego?.kind === "category" && catDiego?.includes("Alimentação")
            ? "MATCH"
            : "UNEXPECTED_DIFF",
      });
    }
  }

  // Cobrança Pendente de Aceite (Eduarda ainda não aceitou, payable.parentId é NULL)
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
      expectedCatOrCreditName: undefined,
      actualKind: rowEduarda?.kind || "none",
      actualCatOrCreditName: undefined,
      status: rowEduarda?.kind === "none" ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 11: Cobrança Bilateral - Aceite (Estrutural via parentId)
  // ---------------------------------------------------------------------------
  const payableDiego = await prisma.balance.findFirst({
    where: {
      contextId: diegoContext?.id,
      name: { contains: "Cobrança Almoço Diego (A Pagar)" },
    },
  });
  if (payableDiego && diegoContext) {
    const catDiego = await getBalanceName(payableDiego.parentId);
    results.push({
      scenario: "11. Aceite Cobrança (ParentId no Devedor)",
      entryDescription: "Aceite estrutural de Cobrança Almoço Diego",
      contextName: "Diego",
      expectedKind: "category",
      expectedCatOrCreditName: "Alimentação & Mercado",
      actualKind: payableDiego.parentId ? "category" : "none",
      actualCatOrCreditName: catDiego,
      status:
        catDiego?.includes("Alimentação") ? "MATCH" : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 12: Cobrança Bilateral - Pagamento (CLAIM_PAYMENT)
  // ---------------------------------------------------------------------------
  const claimPayBilateral = await prisma.entry.findFirst({
    where: { description: { contains: "Pagamento Pix Cobrança Almoço (Diego -> Ana)" } },
  });
  if (claimPayBilateral && diegoContext) {
    const rowDiego = await getViewRow(claimPayBilateral.id, diegoContext.id);
    const catDiego = await getBalanceName(rowDiego?.categoryBalanceId ?? null);
    results.push({
      scenario: "12. Pagamento Cobrança (Ctx Devedor)",
      entryDescription: claimPayBilateral.description,
      contextName: "Diego",
      expectedKind: "category",
      expectedCatOrCreditName: "Alimentação & Mercado",
      actualKind: rowDiego?.kind || "none",
      actualCatOrCreditName: catDiego,
      status:
        rowDiego?.kind === "category" && catDiego?.includes("Alimentação")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });
  }

  // ---------------------------------------------------------------------------
  // Cenário 13: Cobrança Bilateral - Recebimento (CLAIM_RECEIPT)
  // ---------------------------------------------------------------------------
  const claimReceiveBilateral = await prisma.entry.findFirst({
    where: { description: { contains: "Recebimento Pix Cobrança Almoço de Diego" } },
  });
  if (claimReceiveBilateral) {
    const rowAna = await getViewRow(claimReceiveBilateral.id, anaContext.id);
    const catAna = await getBalanceName(rowAna?.categoryBalanceId ?? null);
    results.push({
      scenario: "13a. Recebimento Cobrança (Ctx Credor)",
      entryDescription: claimReceiveBilateral.description,
      contextName: "Ana",
      expectedKind: "category",
      expectedCatOrCreditName: "Alimentação & Mercado",
      actualKind: rowAna?.kind || "none",
      actualCatOrCreditName: catAna,
      status:
        rowAna?.kind === "category" && catAna?.includes("Alimentação")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });

    if (diegoContext) {
      const rowDiego = await getViewRow(claimReceiveBilateral.id, diegoContext.id);
      const catDiego = await getBalanceName(rowDiego?.categoryBalanceId ?? null);
      results.push({
        scenario: "13b. Recebimento Cobrança (Ctx Devedor)",
        entryDescription: claimReceiveBilateral.description,
        contextName: "Diego",
        expectedKind: "category",
        expectedCatOrCreditName: "Alimentação",
        actualKind: rowDiego?.kind || "none",
        actualCatOrCreditName: catDiego,
        status:
          rowDiego?.kind === "category" && catDiego?.includes("Alimentação")
            ? "MATCH"
            : "UNEXPECTED_DIFF",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Cenário 14: Cascata - Recebimento com Passagem Intermediária (CLAIM_RECEIPT)
  // ---------------------------------------------------------------------------
  const claimReceiveCascata = await prisma.entry.findFirst({
    where: { description: { contains: "Recebimento Pix Ingresso Festival de Carla" } },
  });
  if (claimReceiveCascata) {
    // No contexto da Ana (Intermediária): espera-se pass-through via parentId
    const rowAna = await getViewRow(claimReceiveCascata.id, anaContext.id);
    const catAna = await getBalanceName(rowAna?.categoryBalanceId ?? null);
    results.push({
      scenario: "14a. Cascata Passagem (Ctx Intermediário)",
      entryDescription: claimReceiveCascata.description,
      contextName: "Ana",
      expectedKind: "pass-through",
      expectedCatOrCreditName: "Lazer & Assinaturas",
      actualKind: rowAna?.kind || "none",
      actualCatOrCreditName: catAna,
      status:
        rowAna?.kind === "pass-through" && catAna?.includes("Lazer")
          ? "MATCH"
          : "UNEXPECTED_DIFF",
    });

    // No contexto do Bruno (Credor raiz): alívio de 100
    if (brunoContext) {
      const rowBruno = await getViewRow(claimReceiveCascata.id, brunoContext.id);
      const catBruno = await getBalanceName(rowBruno?.categoryBalanceId ?? null);
      results.push({
        scenario: "14b. Cascata Alívio (Ctx Credor Raiz)",
        entryDescription: claimReceiveCascata.description,
        contextName: "Bruno",
        expectedKind: "category",
        expectedCatOrCreditName: "Lazer & Diversão",
        actualKind: rowBruno?.kind || "none",
        actualCatOrCreditName: catBruno,
        status:
          rowBruno?.kind === "category" && catBruno?.includes("Lazer")
            ? "MATCH"
            : "UNEXPECTED_DIFF",
      });
    }

    // No contexto da Carla (Devedora filha): ônus de 100
    if (carlaContext) {
      const rowCarla = await getViewRow(claimReceiveCascata.id, carlaContext.id);
      const catCarla = await getBalanceName(rowCarla?.categoryBalanceId ?? null);
      results.push({
        scenario: "14c. Cascata Ônus (Ctx Devedor Filho)",
        entryDescription: claimReceiveCascata.description,
        contextName: "Carla",
        expectedKind: "category",
        expectedCatOrCreditName: "Lazer & Diversão",
        actualKind: rowCarla?.kind || "none",
        actualCatOrCreditName: catCarla,
        status:
          rowCarla?.kind === "category" && catCarla?.includes("Lazer")
            ? "MATCH"
            : "UNEXPECTED_DIFF",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tabela Comparativa de Resultados
  // ---------------------------------------------------------------------------
  console.log("📋 Tabela Comparativa de Cenários (Esperado de Negócio vs Obtido da View):");
  console.table(
    results.map((r) => ({
      Cenário: r.scenario,
      Contexto: r.contextName,
      "Kind Esperado": r.expectedKind,
      "Kind Obtido": r.actualKind,
      "Cat/Credit Obtido": r.actualCatOrCreditName || "-",
      Status: r.status,
    }))
  );

  const divergences = results.filter((r) => r.status === "DIVERGENCE_KNOWN");
  if (divergences.length > 0) {
    console.log("\n⚠️ Divergências Conhecidas e Documentadas da View:");
    divergences.forEach((d) => {
      console.log(`  - [${d.scenario}]: ${d.divergenceReason}`);
    });
  }

  const unexpected = results.filter((r) => r.status === "UNEXPECTED_DIFF");
  if (unexpected.length > 0) {
    console.error("\n❌ ERRO: Divergências Inesperadas Detectadas:");
    unexpected.forEach((u) => {
      console.error(`  - [${u.scenario}]: Esperado '${u.expectedKind}', obtido '${u.actualKind}'`);
    });
    process.exitCode = 1;
  } else {
    console.log("\n✅ Todos os cenários correspondem ao comportamento esperado (incluindo divergências mapeadas)!");
  }

  // ---------------------------------------------------------------------------
  // EXPLAIN (ANALYZE, BUFFERS) na Query de Extrato com JOIN na View
  // ---------------------------------------------------------------------------
  if (runExplain) {
    console.log("\n================================================================================");
    console.log("⚡ EXPLAIN (ANALYZE, BUFFERS, COSTS, TIMING, VERBOSE) - Query de Extrato com Categorias");
    console.log("================================================================================\n");

    const nubankWallet = await prisma.balance.findFirst({
      where: { name: "Conta Nubank", contextId: anaContext.id },
    });

    if (!nubankWallet) {
      console.warn("Conta Nubank não encontrada para teste de EXPLAIN.");
      return;
    }

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
          cat_app.icon AS "categoryIcon",
          cat_app.color AS "categoryColor"
      FROM "Movement" m
      JOIN "Entry" e ON e.id = m."entryId"
      JOIN "Balance" b ON b.id = m."balanceId"
      LEFT JOIN vw_entry_category vc ON vc."entryId" = e.id AND vc."contextId" = b."contextId"
      LEFT JOIN "Balance" cat ON cat.id = vc."categoryBalanceId"
      LEFT JOIN "BalanceAppearance" cat_app ON cat_app."balanceId" = cat.id
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
