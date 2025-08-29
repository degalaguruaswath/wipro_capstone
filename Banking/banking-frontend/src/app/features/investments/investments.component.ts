import { ToastService } from '../../shared/toast.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({ selector:'app-investments', templateUrl:'./investments.component.html' })
export class InvestmentsComponent {
  model:any = { amount: null, termMonths: null, plan: '', notes:'' };
  constructor(private auth:AuthService, private router:Router, private toast: ToastService){}
  submit(){
    const user = this.auth.currentUser?.();
    if(!user) return this.toast.info('Not logged in');
    const key = 'investments_requests';
    const arr = JSON.parse(localStorage.getItem(key)||'[]');
    arr.push({ id: (Date.now()+Math.random()).toString(36), username:user.username, type:'INVESTMENTS', status:'PENDING', createdAt: new Date().toISOString(), details: this.model });
    localStorage.setItem(key, JSON.stringify(arr));
    this.toast.info('Make an Investment submitted!');
    this.router.navigate(['/dashboard']);
  }
  back(){ this.router.navigate(['/dashboard']); }
}