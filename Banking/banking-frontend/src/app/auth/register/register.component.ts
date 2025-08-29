import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';                // <-- used to wrap boolean into an Observable
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  submitted = false;
  error = '';
  success = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirm:  ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.form.invalid) return;

    if (this.f['password'].value !== this.f['confirm'].value) {
      this.error = 'Passwords do not match';
      return;
    }

    // Call service
    const call: any = this.auth.register(this.f['username'].value || '', this.f['password'].value || '');

    // Normalize: if it's already an Observable, use it; if it's boolean, wrap it as { ok: boolean }
    const result$ = call && typeof call.subscribe === 'function' ? call : of({ ok: !!call });

    result$.subscribe((res: { ok: boolean; msg?: string }) => {
      if (!res.ok) {
        this.error = res?.msg || 'Registration failed';
        return;
      }
      this.success = 'Account created! Sign in now.';
      setTimeout(() => this.router.navigate(['/auth/login']), 900);
    });
  }
}
