import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'info' | 'danger' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts$.asObservable();

  private push(t: Toast) {
    const list = this._toasts$.value.slice();
    list.push(t);
    this._toasts$.next(list);
    const ms = t.timeout ?? 2500;
    if (ms > 0) setTimeout(() => this.dismiss(t.id), ms);
  }

  show(message: string, type: ToastType = 'info', timeout = 2500) {
    this.push({ id: (Date.now()+Math.random()).toString(36), message, type, timeout });
  }
  success(m: string, timeout = 2500) { this.show(m, 'success', timeout); }
  info(m: string, timeout = 2500)    { this.show(m, 'info', timeout); }
  warning(m: string, timeout = 2500) { this.show(m, 'warning', timeout); }
  error(m: string, timeout = 3000)   { this.show(m, 'danger', timeout); }

  dismiss(id: string) { this._toasts$.next(this._toasts$.value.filter(t => t.id !== id)); }
  clear() { this._toasts$.next([]); }
}
