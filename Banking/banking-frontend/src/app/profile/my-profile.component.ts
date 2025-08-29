import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, AppUser } from '../core/auth.service';
import { BankLocalService, Account } from '../services/bank-local.service';
import { ToastService } from '../shared/toast.service';

type Status = 'PENDING' | 'APPROVED' | 'ACCEPTED' | 'REJECTED' | 'HOLD';
type Kind = 'loan' | 'insurance' | 'investment';

interface AnyRequest {
  id: string;
  kind: Kind;
  username: string;
  status: Status;
  createdAt: string;
  details: { [k: string]: any };
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit, OnDestroy {
  user: AppUser | null = null;

  // Accounts + Requests
  myAccounts: Account[] = [];
  myRequests: AnyRequest[] = [];

  // Edit modal state
  isEditing = false;
  editingAccNo: string | null = null;

  editForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.email]],
    dob: [''] // yyyy-MM-dd
  });

  private storageHandler = (e: StorageEvent) => {
    if (!e.key) return;
    if (['loan_requests', 'insurance_requests', 'investment_requests'].includes(e.key)) {
      this.loadRequests();
    }
    if (['bank_accounts_v1', 'bank_accounts'].includes(e.key)) {
      this.loadAccounts();
    }
  };

  private visibilityHandler = () => {
    if (!document.hidden) {
      this.loadAccounts();
      this.loadRequests();
    }
  };

  constructor(
    private auth: AuthService,
    private bank: BankLocalService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    this.loadAccounts();
    this.loadRequests();
    window.addEventListener('storage', this.storageHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  // -------- ACCOUNTS (Account creation details) --------
  private loadAccounts(): void {
    const all = this.bank.listAccounts() || [];
    const uname = (this.user?.username || '').trim().toLowerCase();
    const mine = all.filter(a =>
      (a.holderName || '').toLowerCase() === uname || (a.email || '').toLowerCase() === uname
    );
    this.myAccounts = mine.length > 0 ? mine : all;
    this.cdr.markForCheck?.();
  }

  // -------- REQUESTS --------
  private normalizeStatus(s: any): Status {
    const up = (s || 'PENDING').toString().toUpperCase();
    if (up === 'APPROVED') return 'APPROVED';
    if (up === 'ACCEPTED') return 'ACCEPTED';
    if (up === 'REJECTED') return 'REJECTED';
    if (up === 'HOLD') return 'HOLD';
    return 'PENDING';
  }

  private mapBucket(key: string, kind: Kind): AnyRequest[] {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return (raw as any[]).map(it => ({
      id: it.id,
      kind,
      username: it.username,
      status: this.normalizeStatus(it.status),
      createdAt: it.createdAt || new Date().toISOString(),
      details: it.details ?? it
    }));
  }

  private loadRequests(): void {
    if (!this.user) {
      this.myRequests = [];
      this.cdr.markForCheck?.();
      return;
    }
    const all = [
      ...this.mapBucket('loan_requests', 'loan'),
      ...this.mapBucket('insurance_requests', 'insurance'),
      ...this.mapBucket('investment_requests', 'investment'),
    ];
    this.myRequests = all
      .filter(r => r.username === this.user!.username)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.cdr.markForCheck?.();
  }

  refresh(): void {
    this.loadAccounts();
    this.loadRequests();
  }

  // ===== Editing (phone, email, dob) — not accountNumber or balance =====
  startEdit(a: Account) {
    this.editingAccNo = a.accountNumber;
    const rawDob: string = (a as any).dob || '';
    const uiDob = rawDob ? rawDob.substring(0, 10) : ''; // yyyy-MM-dd
    this.editForm.setValue({
      phone: a.phone || '',
      email: a.email || '',
      dob: uiDob || ''
    });
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingAccNo = null;
    this.editForm.reset();
  }

  saveEdit() {
    if (!this.editingAccNo) return;
    if (this.editForm.invalid) {
      this.toast.warning('Please correct the form errors');
      return;
    }
    const v = this.editForm.value;
    const key = localStorage.getItem('bank_accounts_v1') ? 'bank_accounts_v1' : 'bank_accounts';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    const idx = arr.findIndex((x: any) => x.accountNumber === this.editingAccNo);
    if (idx === -1) {
      this.toast.error('Account not found');
      return;
    }

    // Update allowed fields only
    arr[idx].phone = v.phone || '';
    arr[idx].email = v.email || '';
    // store DOB as ISO date if provided
    arr[idx].dob = v.dob ? new Date(v.dob as string).toISOString() : '';

    // touch updatedAt
    arr[idx].updatedAt = new Date().toISOString();

    localStorage.setItem(key, JSON.stringify(arr));

    // refresh UI
    this.loadAccounts();
    this.isEditing = false;
    this.editingAccNo = null;
    this.toast.success('Account details updated');
  }
}

