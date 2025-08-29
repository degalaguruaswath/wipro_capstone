import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';


export interface Account {
  account_no: string;
  user_id: number;
  name: string;
  dob?: string;
  gender?: string;
  aadhar?: string;
  phone?: string;
  email?: string;
  balance: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private base = environment.accountServiceUrl; 

  constructor(private http: HttpClient) {}

  getAccount(accountNo: string): Observable<Account> {
    return this.http.get<Account>(`${this.base}/${accountNo}`);
  }

  listByUser(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.base}?user_id=${userId}`);
  }
}
