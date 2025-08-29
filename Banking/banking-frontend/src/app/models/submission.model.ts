export interface Submission {
  id: string;                // uuid-like
  holderName: string;
  phone: string;
  email: string;
  accountType: 'Savings' | 'Current' | 'Student' | 'Salary' | string;
  initialDeposit: number;
  createdAt: string;         // ISO date
}