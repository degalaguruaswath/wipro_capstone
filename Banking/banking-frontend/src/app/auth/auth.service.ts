import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Role = 'ADMIN' | 'CUSTOMER' | 'EMPLOYEE';
export interface User { id: number; name: string; role: Role; token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this._user$.asObservable();

  get user(): User | null { return this._user$.value; }
  get isLoggedIn(): boolean { return !!this.user; }
  get role(): Role | null { return this.user?.role ?? null; }

  loginSuccess(user: User) {           // call this after successful login API
    localStorage.setItem('user', JSON.stringify(user));
    this._user$.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this._user$.next(null);
  }

  hasRole(...roles: Role[]): boolean {
    return !!this.role && roles.includes(this.role);
  }

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }
}
