import sampleResponse from './__fixtures__/transactions.json';

const counterparties = [
  'AEON Market',
  'Nur Aisyah',
  'City Rail',
  'Kopi & Co.',
  'Green Energy Utilities',
  'Lim Wei Jian',
  'Taman Community Cooperative and Neighbourhood Services',
  'Sinar Digital',
  'Maya Fernandez',
  'Weekend Bookshop',
];
const outgoingNames = [
  'Weekly groceries',
  'Lunch payment',
  'Monthly transport pass',
  'Coffee',
  'Electricity bill',
  'Shared dinner',
  'Community maintenance contribution — annual facilities and gardening',
  'Internet subscription',
  'Rent payment',
  'Books and stationery',
];
const incomingNames = ['Salary Payment', 'Savings transfer', 'Expense reimbursement', 'Cashback'];

/** Stable IDs and UTC dates keep refreshes, detail links and offline caching reproducible. */
export const demoTransactionsResponse = {
  data: [
    ...sampleResponse.data,
    ...Array.from({ length: 240 }, (_, index) => {
      const incoming = index % 4 === 0;
      const amountMinor =
        index % 31 === 0 ? 1 : index % 29 === 0 ? 1250000 : 250 + ((index * 7919) % 185000);
      return {
        refId: `DEMO${String(index + 1).padStart(6, '0')}`,
        // Leave the original four assessment records at the top for smoke tests.
        // Two transfers each day also exercise stable same-date sorting.
        transferDate: new Date(
          Date.UTC(2024, 7, 29 - Math.floor(index / 2), 9, index % 2 ? 45 : 15),
        ).toISOString(),
        recipientName: counterparties[index % counterparties.length],
        transferName: incoming
          ? incomingNames[Math.floor(index / 4) % incomingNames.length]
          : outgoingNames[index % outgoingNames.length],
        amount: (incoming ? amountMinor : -amountMinor) / 100,
      };
    }),
  ],
};
