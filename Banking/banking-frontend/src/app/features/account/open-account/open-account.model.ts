export type AccountType = 'SAVINGS' | 'CURRENT' | 'SALARY';

export interface OpenAccountRequest {
  holderName: string;
  phone: string;
  email: string;
  accountType: AccountType;
  initialDeposit: number;
}

export interface AccountSubmission extends OpenAccountRequest {
  id: string;
  submittedAt: string; // ISO date
}