export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

export interface Transaction {
  id?: number;                 // unique id
  accountNumber: string;       // source account for deposit/withdraw; sender for transfer
  toAccountNumber?: string;    // required for transfer
  name: string;                // customer name
  phone: string;
  amount: number;
  type: TransactionType;
  dateTime?: string;           // ISO string
  remarks?: string;
  feedback?: string;
  balanceAfter?: number;       // returned by backend
}