import type { CardFixture } from "../types";

export const cardsFixture: CardFixture[] = [
  // ==========================================
  // Ana (30 cartões para teste de carga/estresse)
  // ==========================================
  {
    ownerEmail: "ana@teste.com",
    name: "Nubank Ultravioleta Mastercard Black",
    limit: 3500000, // R$ 35.000,00
    closingDay: 28,
    dueDay: 5,
    initialExpenses: [
      { description: "Compra Supermercado Pão de Açúcar", amount: 1425080, date: "2026-08-30T19:45:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "XP Visa Infinite",
    limit: 5000000, // R$ 50.000,00
    closingDay: 15,
    dueDay: 22,
    initialExpenses: [
      { description: "Passagens Aéreas LATAM", amount: 893040, date: "2026-08-29T14:20:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Itaú Personnalité Mastercard Black",
    limit: 4000000, // R$ 40.000,00
    closingDay: 20,
    dueDay: 28,
    initialExpenses: [
      { description: "Reserva Hotel Booking.com", amount: 2215000, date: "2026-08-28T10:15:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "C6 Carbon Mastercard Black",
    limit: 2500000, // R$ 25.000,00
    closingDay: 10,
    dueDay: 17,
    initialExpenses: [
      { description: "Restaurante Fasano", amount: 320050, date: "2026-08-27T18:00:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Inter Mastercard Black",
    limit: 3000000, // R$ 30.000,00
    closingDay: 5,
    dueDay: 12,
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Bradesco Elo Nanquim",
    limit: 2800000, // R$ 28.000,00
    closingDay: 12,
    dueDay: 20,
    initialExpenses: [
      { description: "Revisão Concessionária Honda", amount: 1250000, date: "2026-08-25T09:30:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Santander Unique Visa Infinite",
    limit: 3200000, // R$ 32.000,00
    closingDay: 25,
    dueDay: 2,
    initialExpenses: [
      { description: "Eletrônicos FastShop", amount: 674090, date: "2026-08-24T16:45:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "BTG Pactual Black Modular",
    limit: 4500000, // R$ 45.000,00
    closingDay: 18,
    dueDay: 25,
    initialExpenses: [
      { description: "Seguro Residencial", amount: 1890000, date: "2026-08-23T11:10:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Porto Bank Visa Infinite",
    limit: 3800000, // R$ 38.000,00
    closingDay: 7,
    dueDay: 15,
    initialExpenses: [
      { description: "Abastecimento Posto Shell", amount: 430000, date: "2026-08-22T20:15:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Nubank Gold Mastercard",
    limit: 800000, // R$ 8.000,00
    closingDay: 28,
    dueDay: 5,
    isArchived: true,
    initialExpenses: [
      { description: "Assinatura Netflix", amount: 120000, date: "2026-07-15T12:00:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Caixa Elo Diners Club",
    limit: 2200000, // R$ 22.000,00
    closingDay: 14,
    dueDay: 21,
    initialExpenses: [
      { description: "Farmácia Droga Raia", amount: 950000, date: "2026-08-20T15:30:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Mercado Pago Visa Platinum",
    limit: 650000, // R$ 6.500,00
    closingDay: 3,
    dueDay: 10,
    initialExpenses: [
      { description: "Compras Mercado Livre", amount: 154020, date: "2026-08-19T17:25:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Banco do Brasil Altus Visa Infinite",
    limit: 6000000, // R$ 60.000,00
    closingDay: 1,
    dueDay: 8,
    initialExpenses: [
      { description: "Mobiliário Tok&Stok", amount: 2890000, date: "2026-08-18T13:50:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Sicredi Mastercard Black",
    limit: 2000000, // R$ 20.000,00
    closingDay: 16,
    dueDay: 23,
    initialExpenses: [
      { description: "Artigos Esportivos Decathlon", amount: 520000, date: "2026-08-17T08:40:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Sicoob Mastercard Black Merit",
    limit: 3500000, // R$ 35.000,00
    closingDay: 22,
    dueDay: 30,
    initialExpenses: [
      { description: "Jantar Família", amount: 1100000, date: "2026-08-16T19:10:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Nomad Visa Platinum Internacional",
    limit: 1500000, // R$ 15.000,00
    closingDay: 9,
    dueDay: 16,
    initialExpenses: [
      { description: "Apple Store US", amount: 340000, date: "2026-08-15T21:00:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Wise Visa Internacional",
    limit: 1000000, // R$ 10.000,00
    closingDay: 27,
    dueDay: 4,
    initialExpenses: [
      { description: "Uber Viagem Paris", amount: 85000, date: "2026-08-14T16:15:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Digio Visa Gold",
    limit: 500000, // R$ 5.000,00
    closingDay: 11,
    dueDay: 18,
    isArchived: true,
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Next Visa Internacional",
    limit: 400000, // R$ 4.000,00
    closingDay: 15,
    dueDay: 22,
    isArchived: true,
  },
  {
    ownerEmail: "ana@teste.com",
    name: "PicPay Card Mastercard Platinum",
    limit: 750000, // R$ 7.500,00
    closingDay: 8,
    dueDay: 15,
    initialExpenses: [
      { description: "iFood Delivery", amount: 290000, date: "2026-08-12T10:30:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Amazon Prime Mastercard Platinum",
    limit: 1200000, // R$ 12.000,00
    closingDay: 19,
    dueDay: 26,
    initialExpenses: [
      { description: "Amazon Compras Prime", amount: 680000, date: "2026-08-11T14:00:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Azul Itaú Visa Infinite",
    limit: 4500000, // R$ 45.000,00
    closingDay: 26,
    dueDay: 3,
    initialExpenses: [
      { description: "Pacote Azul Viagens", amount: 1750000, date: "2026-08-10T18:45:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "LATAM Pass Itaú Mastercard Black",
    limit: 3800000, // R$ 38.000,00
    closingDay: 21,
    dueDay: 28,
    initialExpenses: [
      { description: "Upgrade Cabine LATAM", amount: 1230000, date: "2026-08-09T11:20:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Smiles Gol Santander Visa Infinite",
    limit: 3200000, // R$ 32.000,00
    closingDay: 13,
    dueDay: 20,
    initialExpenses: [
      { description: "Reserva Smiles", amount: 940000, date: "2026-08-08T15:10:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Pão de Açúcar Itaú Mastercard Black",
    limit: 2900000, // R$ 29.000,00
    closingDay: 6,
    dueDay: 13,
    initialExpenses: [
      { description: "Compras Semanais PDA", amount: 810000, date: "2026-08-07T09:00:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Carrefour Mastercard Gold",
    limit: 450000, // R$ 4.500,00
    closingDay: 4,
    dueDay: 11,
    initialExpenses: [
      { description: "Eletrodomésticos Carrefour", amount: 120000, date: "2026-08-06T17:30:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "C&A Bradescard Visa Gold",
    limit: 350000, // R$ 3.500,00
    closingDay: 17,
    dueDay: 24,
    isArchived: true,
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Renner Meu Cartão Mastercard",
    limit: 300000, // R$ 3.000,00
    closingDay: 23,
    dueDay: 30,
    initialExpenses: [
      { description: "Roupas Lojas Renner", amount: 95000, date: "2026-08-04T13:15:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Magalu Visa Platinum",
    limit: 550000, // R$ 5.500,00
    closingDay: 2,
    dueDay: 9,
    initialExpenses: [
      { description: "Smartphone Magazine Luiza", amount: 210000, date: "2026-08-03T10:45:00Z" }
    ]
  },
  {
    ownerEmail: "ana@teste.com",
    name: "RappiCard Visa Gold",
    limit: 400000, // R$ 4.000,00
    closingDay: 18,
    dueDay: 25,
    isArchived: true,
  },

  // ==========================================
  // Bruno
  // ==========================================
  {
    ownerEmail: "bruno@teste.com",
    name: "Inter Mastercard Black",
    limit: 2000000,
    closingDay: 10,
    dueDay: 17,
    initialExpenses: [
      { description: "Aluguel Carro Localiza", amount: 450000, date: "2026-09-10T14:00:00Z" }
    ]
  },
  {
    ownerEmail: "bruno@teste.com",
    name: "Nubank Platinum Mastercard",
    limit: 1200000,
    closingDay: 25,
    dueDay: 2,
    initialExpenses: [
      { description: "Assinatura Spotify", amount: 3490, date: "2026-09-12T10:00:00Z" }
    ]
  },

  // ==========================================
  // Carla
  // ==========================================
  {
    ownerEmail: "carla@teste.com",
    name: "Santander SX Visa Gold",
    limit: 800000,
    closingDay: 15,
    dueDay: 22,
    initialExpenses: [
      { description: "Livros Livraria Cultura", amount: 150000, date: "2026-09-14T11:30:00Z" }
    ]
  },
  {
    ownerEmail: "carla@teste.com",
    name: "C6 Mastercard Standard",
    limit: 500000,
    closingDay: 5,
    dueDay: 12,
  },

  // ==========================================
  // Diego
  // ==========================================
  {
    ownerEmail: "diego@teste.com",
    name: "Bradesco Like Visa",
    limit: 1500000,
    closingDay: 20,
    dueDay: 28,
    initialExpenses: [
      { description: "Ingressos Cinema & Show", amount: 380000, date: "2026-09-18T20:00:00Z" }
    ]
  }
];
