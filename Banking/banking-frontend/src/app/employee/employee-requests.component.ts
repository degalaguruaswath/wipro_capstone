import { ToastService } from '../shared/toast.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

// Support both new and legacy labels so we never crash on existing data
type Status = 'PENDING' | 'APPROVED' | 'ACCEPTED' | 'REJECTED' | 'HOLD';

interface Req {
  id: string;
  type: string;           // 'loan' | 'insurance' | 'investment' | 'delete' (if you keep delete_requests)
  username: string;
  status: Status;
  createdAt: string;
  details: any;
  key: string;            // storage bucket key
}

@Component({
  selector: 'app-employee-requests',
  templateUrl: './employee-requests.component.html'
})
export class EmployeeRequestsComponent {
  list: Req[] = [];

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {
    const u = this.auth.currentUser?.();
    // Be tolerant of different casings ('EMPLOYEE' vs 'employee')
    if (!u || (u.role as any)?.toString?.().toLowerCase() !== 'employee') {
      this.toast.info('Employee access only');
      this.router.navigate(['/login']);
      return;
    }
    this.load();
  }

  private normalizeStatus(s: any): Status {
    const up = (s || 'PENDING').toString().toUpperCase();
    if (up === 'APPROVED') return 'APPROVED';
    if (up === 'ACCEPTED') return 'ACCEPTED';
    if (up === 'REJECTED') return 'REJECTED';
    if (up === 'HOLD') return 'HOLD';
    return 'PENDING';
  }

  load(): void {
    // Add or remove buckets as per your app
    const keys = ['loan_requests', 'insurance_requests', 'investment_requests', 'delete_requests'];
    const all: Req[] = [];

    for (const k of keys) {
      try {
        const arr = JSON.parse(localStorage.getItem(k) || '[]');
        for (const it of arr) {
          all.push({
            id: it.id,
            type:
              k === 'loan_requests'
                ? 'loan'
                : k === 'insurance_requests'
                ? 'insurance'
                : k === 'investment_requests'
                ? 'investment'
                : (it.type || 'delete'),
            username: it.username,
            status: this.normalizeStatus(it.status),
            createdAt: it.createdAt || new Date().toISOString(),
            details: it.details ?? it,
            key: k
          });
        }
      } catch {
        // ignore bad/missing buckets
      }
    }

    // newest first
    this.list = all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  setStatus(item: Req, status: Status): void {
    const arr = JSON.parse(localStorage.getItem(item.key) || '[]');
    const idx = arr.findIndex((r: any) => r.id === item.id);
    if (idx >= 0) {
      arr[idx].status = status;
      localStorage.setItem(item.key, JSON.stringify(arr));
      // reflect change in UI without re-reading everything
      item.status = status;
      // or call this.load() if you prefer to fully refresh:
      // this.load();
    }
  }

  back(): void {
    // if you have an employee dashboard route, send them there; else to login/dashboard
    this.router.navigate(['/employee']).catch(() => this.router.navigate(['/dashboard']));
  }
}
