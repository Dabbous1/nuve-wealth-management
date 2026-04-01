import Colors from './colors';

export const SPEND_CATEGORIES = [
  { label: 'Groceries', value: 28, color: Colors.chart1, icon: 'shopping-cart' as const },
  { label: 'Shopping',  value: 22, color: Colors.chart2, icon: 'package' as const },
  { label: 'Transport', value: 18, color: Colors.chart3, icon: 'navigation' as const },
  { label: 'Food',      value: 15, color: Colors.chart4, icon: 'coffee' as const },
  { label: 'Other',     value: 17, color: Colors.chart5, icon: 'more-horizontal' as const },
];

export const SPEND_MONTH_TOTAL = 3895;
export const SPEND_MONTH_LABEL = 'Mar 2026';

export const CARD_TRANSACTIONS: {
  merchant: string;
  category: string;
  amount: string;
  amountNum: number;
  date: string;
  icon: string;
}[] = [
  { merchant: 'Carrefour Market', category: 'Groceries', amount: 'EGP 850',   amountNum: 850,  date: 'Today, 14:32',       icon: 'shopping-cart' },
  { merchant: 'Metro Market',     category: 'Groceries', amount: 'EGP 242',   amountNum: 242,  date: 'Mar 28, 11:10',      icon: 'shopping-cart' },
  { merchant: 'Hyper One',        category: 'Groceries', amount: 'EGP 240',   amountNum: 240,  date: 'Mar 22, 09:45',      icon: 'shopping-cart' },
  { merchant: 'Netflix',          category: 'Other',     amount: 'EGP 180',   amountNum: 180,  date: 'Yesterday, 09:00',   icon: 'tv' },
  { merchant: 'Shahid VIP',       category: 'Other',     amount: 'EGP 99',    amountNum: 99,   date: 'Mar 24, 08:00',      icon: 'tv' },
  { merchant: 'Vodafone',         category: 'Other',     amount: 'EGP 250',   amountNum: 250,  date: 'Mar 20, 10:00',      icon: 'phone' },
  { merchant: 'Uber',             category: 'Transport', amount: 'EGP 120',   amountNum: 120,  date: 'Mar 27, 18:45',      icon: 'navigation' },
  { merchant: 'Careem',           category: 'Transport', amount: 'EGP 95',    amountNum: 95,   date: 'Mar 26, 17:30',      icon: 'navigation' },
  { merchant: 'Cairo Metro',      category: 'Transport', amount: 'EGP 36',    amountNum: 36,   date: 'Mar 25, 08:15',      icon: 'map' },
  { merchant: 'inDrive',          category: 'Transport', amount: 'EGP 450',   amountNum: 450,  date: 'Mar 18, 20:00',      icon: 'navigation' },
  { merchant: 'Starbucks',        category: 'Food',      amount: 'EGP 95',    amountNum: 95,   date: 'Mar 26, 08:15',      icon: 'coffee' },
  { merchant: 'Koshary El Tahrir',category: 'Food',      amount: 'EGP 85',    amountNum: 85,   date: 'Mar 24, 13:30',      icon: 'coffee' },
  { merchant: 'Pizza Hut',        category: 'Food',      amount: 'EGP 390',   amountNum: 390,  date: 'Mar 22, 20:15',      icon: 'coffee' },
  { merchant: 'Amazon Egypt',     category: 'Shopping',  amount: 'EGP 2,400', amountNum: 2400, date: 'Mar 25, 11:30',      icon: 'package' },
  { merchant: 'Jumia',            category: 'Shopping',  amount: 'EGP 455',   amountNum: 455,  date: 'Mar 19, 14:00',      icon: 'package' },
];
