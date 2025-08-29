export interface Account {
  id?: number;               // internal id from DB (optional)
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'FD' | 'RD';
  holderName: string;
  phone: string;
  email?: string;
  openedDate: string;        // ISO date string
  balance: number;
  isActive: boolean;
}