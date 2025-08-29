import { ToastService } from '../../shared/toast.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({ selector:'app-loans', templateUrl:'./loans.component.html' })
export class LoansComponent {
  model:any = { amount: null, termMonths: null, plan: '', notes:'' };
  constructor(private auth:AuthService, private router:Router, private toast: ToastService){}
  submit(){
    const user = this.auth.currentUser();
    if(!user) return this.toast.info('Not logged in');
    const key = 'loan_requests';
    const arr = JSON.parse(localStorage.getItem(key)||'[]');
    arr.push({ id: (Date.now()+Math.random()).toString(36), username:user.username, type:'LOANS', status:'PENDING', createdAt: new Date().toISOString(), details: this.model });
    localStorage.setItem(key, JSON.stringify(arr));
    this.toast.info('Apply for Loan submitted!');
    this.router.navigate(['/dashboard']);
  }
  back(){ this.router.navigate(['/dashboard']); }
}