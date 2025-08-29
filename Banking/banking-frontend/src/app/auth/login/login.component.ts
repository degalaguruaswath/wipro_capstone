import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({ selector:'app-login', templateUrl:'./login.component.html' })
export class LoginComponent {
  loading=false; submitted=false; error='';
  form=this.fb.group({ username:['',[Validators.required,Validators.minLength(3)]], password:['',[Validators.required,Validators.minLength(4)]] });
  constructor(private fb:FormBuilder, private auth:AuthService, private router:Router) {}
  get f(){ return this.form.controls; }
  onSubmit(){ this.submitted=true; this.error=''; if(this.form.invalid) return;
    this.loading=true; const ok=this.auth.login(this.f['username'].value||'', this.f['password'].value||''); this.loading=false;
    if(ok) this.router.navigate(['/dashboard']); else this.error='Invalid username or password';
  }
}
