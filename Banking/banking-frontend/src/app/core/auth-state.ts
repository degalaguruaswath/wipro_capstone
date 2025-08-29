import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserInfo {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthState {
  private _user$ = new BehaviorSubject<UserInfo | null>(null);
  user$ = this._user$.asObservable();

  setUser(u: UserInfo | null) { this._user$.next(u); }
  get user() { return this._user$.value; }
  get isLoggedIn() { return !!this._user$.value; }
}
