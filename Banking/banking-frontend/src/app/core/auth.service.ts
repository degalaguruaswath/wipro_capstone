import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type Role = 'user' | 'employee';
export type AppUser = { username: string; role: Role };

// Back-compat alias so `AuthUser` imports keep working
export type AuthUser = AppUser;

type StoredUser = { username: string; password: string; role: Role };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private KEY = 'auth_user';       // current logged-in user
  private USERS = 'auth_users';    // registered users list

  constructor(private router: Router) {}

  // ---------- REGISTER ----------
  register(username: string, password: string): boolean {
    username = (username || '').trim();
    password = (password || '').trim();
    if (!username || !password) return false;

    // reserved employee account
    if (username.toLowerCase() === 'employee') return false;

    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false; // username taken
    }

    users.push({ username, password, role: 'user' });
    this.saveUsers(users);

    // auto-login after register (optional)
    this.setCurrentUser({ username, role: 'user' });
    return true;
  }

  // ---------- LOGIN ----------
  login(username: string, password: string): boolean {
    username = (username || '').trim();
    password = (password || '').trim();
    if (!username || !password) return false;

    // demo employee account
    if (username.toLowerCase() === 'employee' && password === 'employee') {
      this.setCurrentUser({ username: 'employee', role: 'employee' });
      this.router.navigate(['/employee/requests']).catch(() => {});
      return true;
    }

    const users = this.getUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!found) return false;

    this.setCurrentUser({ username: found.username, role: found.role });
    this.router.navigate([found.role === 'employee' ? '/employee' : '/dashboard']).catch(() => {});
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.router.navigate(['/login']).catch(() => {});
  }

  currentUser(): AppUser | null {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }

  get current(): AppUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  isEmployee(): boolean {
    return (this.currentUser()?.role || '').toLowerCase() === 'employee';
  }

  // ---------- helpers ----------
  private setCurrentUser(user: AppUser): void {
    localStorage.setItem(this.KEY, JSON.stringify(user));
  }

  private getUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(this.USERS) || '[]') as StoredUser[];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.USERS, JSON.stringify(users));
  }
}
