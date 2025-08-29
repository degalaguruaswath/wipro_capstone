import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private base = environment.transactionServiceUrl;

  constructor(private http: HttpClient) {}

  deposit(data: { accountNumber: string; amount: number; remarks?: string }): Observable<any> {
    return this.http.post(`${this.base}/deposit`, data);
  }

  withdraw(data: { accountNumber: string; amount: number; remarks?: string }): Observable<any> {
    return this.http.post(`${this.base}/withdraw`, data);
  }

  transfer(data: { fromAccount: string; toAccount: string; amount: number; remarks?: string }): Observable<any> {
    return this.http.post(`${this.base}/transfer`, data);
  }

  history(accountNumber: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/history/${accountNumber}`);
  }
}