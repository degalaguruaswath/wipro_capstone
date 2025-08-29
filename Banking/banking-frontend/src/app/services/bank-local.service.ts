import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type AccountType = 'SAVINGS'|'CURRENT';
export interface Account { accountNumber:string; holderName:string; phone:string; email:string; accountType:AccountType; balance:number; status:'ACTIVE'|'CLOSED'; createdAt:string; updatedAt:string; }
export interface Transaction { id:string; accountNumber:string; type:'OPEN'|'DEPOSIT'|'WITHDRAW'|'TRANSFER_OUT'|'TRANSFER_IN'|'CLOSE'|'UPDATE'; amount:number; remarks?:string; date:string; counterparty?:string; }

const ACCOUNTS_KEY='bank_accounts_v1'; const TXNS_KEY='bank_transactions_v1';
function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }

@Injectable({ providedIn:'root' })
export class BankLocalService {
  constructor(private http: HttpClient){}
  private load<T>(k:string,f:T):T{ const r=localStorage.getItem(k); return r? JSON.parse(r) as T : f; }
  private save<T>(k:string,v:T){ localStorage.setItem(k, JSON.stringify(v)); }

  async syncFromBackend(){ try{
    const [ra,rt]= await Promise.all([ this.http.get<Account[]>(`${environment.apiBase}/accounts`).toPromise(), this.http.get<Transaction[]>(`${environment.apiBase}/transactions`).toPromise() ]);
    if(ra){ const local=this.load<Account[]>(ACCOUNTS_KEY,[]); const map=new Map(local.map(a=>[a.accountNumber,a])); for(const a of ra) map.set(a.accountNumber,a); this.save(ACCOUNTS_KEY, Array.from(map.values())); }
    if(rt){ const localT=this.load<Transaction[]>(TXNS_KEY,[]); const ids=new Set(localT.map(t=>t.id)); for(const t of rt) if(!ids.has(t.id)) localT.push(t); this.save(TXNS_KEY, localT); }
  }catch{} }

  listAccounts():Account[]{ return this.load<Account[]>(ACCOUNTS_KEY,[]); }
  listTransactions(acc?:string):Transaction[]{ const all=this.load<Transaction[]>(TXNS_KEY,[]); return acc? all.filter(t=> t.accountNumber===acc || t.counterparty===acc) : all; }
  getAccount(n:string){ return this.listAccounts().find(a=>a.accountNumber===n); }

  openAccount(d:{accountNumber:string;holderName:string;phone:string;email:string;accountType:AccountType;initialDeposit?:number}):Account{
    const accounts=this.listAccounts(); if(accounts.some(a=>a.accountNumber===d.accountNumber)) throw new Error('Account number exists');
    const now=new Date().toISOString(); const acc:Account={ accountNumber:d.accountNumber, holderName:d.holderName, phone:d.phone, email:d.email, accountType:d.accountType, balance:Math.max(0,d.initialDeposit||0), status:'ACTIVE', createdAt:now, updatedAt:now };
    accounts.push(acc); this.save(ACCOUNTS_KEY, accounts); const tx=this.listTransactions(); tx.push({id:uid(),accountNumber:acc.accountNumber,type:'OPEN',amount:acc.balance,date:now,remarks:'Account opened'}); this.save(TXNS_KEY,tx);
    this.http.post(`${environment.apiBase}/accounts`, acc).subscribe({next:()=>{}, error:()=>{}}); return acc;
  }
  updateAccount(n:string, patch:Partial<Pick<Account,'holderName'|'phone'|'email'|'accountType'>>):Account{
    const accounts=this.listAccounts(); const acc=accounts.find(a=>a.accountNumber===n); if(!acc) throw new Error('Account not found');
    Object.assign(acc,patch); acc.updatedAt=new Date().toISOString(); this.save(ACCOUNTS_KEY,accounts);
    const tx=this.listTransactions(); tx.push({id:uid(),accountNumber:n,type:'UPDATE',amount:0,date:acc.updatedAt,remarks:'Account updated'}); this.save(TXNS_KEY,tx);
    this.http.put(`${environment.apiBase}/accounts/${n}`, patch).subscribe({next:()=>{}, error:()=>{}}); return acc;
  }
  closeAccount(n:string){ const accounts=this.listAccounts(); const acc=accounts.find(a=>a.accountNumber===n); if(!acc) throw new Error('Account not found');
    acc.status='CLOSED'; acc.updatedAt=new Date().toISOString(); this.save(ACCOUNTS_KEY,accounts); const tx=this.listTransactions(); tx.push({id:uid(),accountNumber:n,type:'CLOSE',amount:0,date:acc.updatedAt,remarks:'Account closed'}); this.save(TXNS_KEY,tx);
    this.http.delete(`${environment.apiBase}/accounts/${n}`).subscribe({next:()=>{}, error:()=>{}});
  }
  deposit(n:string, amt:number, remarks?:string):Account{
    if(amt<=0) throw new Error('Amount must be positive'); const accounts=this.listAccounts(); const acc=accounts.find(a=>a.accountNumber===n); if(!acc) throw new Error('Account not found'); if(acc.status!=='ACTIVE') throw new Error('Account not active');
    acc.balance+=amt; acc.updatedAt=new Date().toISOString(); this.save(ACCOUNTS_KEY,accounts); const tx=this.listTransactions(); tx.push({id:uid(),accountNumber:n,type:'DEPOSIT',amount:amt,date:acc.updatedAt,remarks}); this.save(TXNS_KEY,tx);
    this.http.post(`${environment.apiBase}/transactions/deposit`, {accountNumber:n, amount:amt, remarks}).subscribe({next:()=>{}, error:()=>{}}); return acc;
  }
  withdraw(n:string, amt:number, remarks?:string):Account{
    if(amt<=0) throw new Error('Amount must be positive'); const accounts=this.listAccounts(); const acc=accounts.find(a=>a.accountNumber===n); if(!acc) throw new Error('Account not found'); if(acc.status!=='ACTIVE') throw new Error('Account not active'); if(acc.balance<amt) throw new Error('Insufficient balance');
    acc.balance-=amt; acc.updatedAt=new Date().toISOString(); this.save(ACCOUNTS_KEY,accounts); const tx=this.listTransactions(); tx.push({id:uid(),accountNumber:n,type:'WITHDRAW',amount:amt,date:acc.updatedAt,remarks}); this.save(TXNS_KEY,tx);
    this.http.post(`${environment.apiBase}/transactions/withdraw`, {accountNumber:n, amount:amt, remarks}).subscribe({next:()=>{}, error:()=>{}}); return acc;
  }
  transfer(f:string, t:string, amt:number, remarks?:string){ if(f===t) throw new Error('Cannot transfer to same account'); if(amt<=0) throw new Error('Amount must be positive');
    this.withdraw(f,amt, remarks?`To ${t} - ${remarks}`:`To ${t}`); this.deposit(t,amt, remarks?`From ${f} - ${remarks}`:`From ${f}`);
    this.http.post(`${environment.apiBase}/transactions/transfer`, {fromAccount:f,toAccount:t,amount:amt,remarks}).subscribe({next:()=>{}, error:()=>{}});
  }
}
