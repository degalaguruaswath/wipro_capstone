import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { BankLocalService, Account, Transaction } from '../services/bank-local.service';
import { ToastService } from '../shared/toast.service';

const ACCOUNT_LEN = 12;
const phonePattern = /^[0-9]{10}$/;

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  tab: 'open' | 'deposit' | 'withdraw' | 'transfer' | 'accounts' | 'history' = 'open';

  openForm = this.fb.group({
    accountNumber: ['', [Validators.required, Validators.minLength(ACCOUNT_LEN), Validators.maxLength(ACCOUNT_LEN)]],
    holderName: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(phonePattern)]],
    email: [''],
    accountType: ['SAVINGS', [Validators.required]],
    initialDeposit: [0, [Validators.min(0)]]
  });

  depositForm = this.fb.group({
    accountNumber: ['', [Validators.required, Validators.minLength(ACCOUNT_LEN), Validators.maxLength(ACCOUNT_LEN)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    remarks: ['']
  });

  withdrawForm = this.fb.group({
    accountNumber: ['', [Validators.required, Validators.minLength(ACCOUNT_LEN), Validators.maxLength(ACCOUNT_LEN)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    remarks: ['']
  });

  transferForm = this.fb.group({
    fromAccount: ['', [Validators.required, Validators.minLength(ACCOUNT_LEN), Validators.maxLength(ACCOUNT_LEN)]],
    toAccount: ['', [Validators.required, Validators.minLength(ACCOUNT_LEN), Validators.maxLength(ACCOUNT_LEN)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    remarks: ['']
  });

  accounts: Account[] = [];
  txns: Transaction[] = [];

  // NEW: request statuses to show in Accounts section
  myRequests: AnyRequest[] = [];

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private bank: BankLocalService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.refresh();
    this.bank.syncFromBackend();
  }

  ngOnInit(): void {
    this.loadRequests();
    window.addEventListener('storage', this.storageHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  setTab(t: any) {
    this.tab = t;
    if (t === 'accounts') {
      this.refresh();
      this.loadRequests(); // keep statuses fresh when user switches back
    }
    if (t === 'history') this.loadHistory();
  }

  private showToast(m: string) { this.toast.success(m); }

  refresh() { this.accounts = this.bank.listAccounts(); }

  loadHistory() { this.txns = this.bank.listTransactions(); }

  openAccount() {
    if (this.openForm.invalid) return;
    const v = this.openForm.value;
    try {
      this.bank.openAccount({
        accountNumber: v.accountNumber!, holderName: v.holderName!, phone: v.phone!,
        email: v.email || '', accountType: v.accountType as any,
        initialDeposit: Number(v.initialDeposit || 0)
      });
      this.openForm.reset({ accountType: 'SAVINGS', initialDeposit: 0 });
      this.refresh();
      this.showToast('✅ Account created successfully');
      this.tab = 'accounts';
    } catch (e: any) { this.toast.info(e.message || e); }
  }

  deposit() {
    if (this.depositForm.invalid) return;
    const v = this.depositForm.value;
    try {
      this.bank.deposit(v.accountNumber!, Number(v.amount || 0), v.remarks || '');
      this.depositForm.reset({ amount: 0 });
      this.refresh();
      this.showToast('✅ Amount deposited successfully');
    } catch (e: any) { this.toast.info(e.message || e); }
  }

  withdraw() {
    if (this.withdrawForm.invalid) return;
    const v = this.withdrawForm.value;
    try {
      this.bank.withdraw(v.accountNumber!, Number(v.amount || 0), v.remarks || '');
      this.withdrawForm.reset({ amount: 0 });
      this.refresh();
      this.showToast('✅ Amount withdrawn successfully');
    } catch (e: any) { this.toast.info(e.message || e); }
  }

  transfer() {
    if (this.transferForm.invalid) return;
    const v = this.transferForm.value;
    try {
      this.bank.transfer(v.fromAccount!, v.toAccount!, Number(v.amount || 0), v.remarks || '');
      this.transferForm.reset({ amount: 0 });
      this.refresh();
      this.showToast('✅ Transaction done');
    } catch (e: any) { this.toast.info(e.message || e); }
  }

  // ===== My Requests panel (Accounts tab) =====
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

  loadRequests() {
    const user = this.auth.currentUser();
    if (!user) { this.myRequests = []; return; }
    const all = [
      ...this.mapBucket('loan_requests', 'loan'),
      ...this.mapBucket('insurance_requests', 'insurance'),
      ...this.mapBucket('investment_requests', 'investment')
    ];
    this.myRequests = all
      .filter(r => r.username === user.username)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    this.cdr.markForCheck?.();
  }

  private storageHandler = (e: StorageEvent) => {
    if (!e.key) return;
    if (['loan_requests','insurance_requests','investment_requests'].includes(e.key)) {
      this.loadRequests();
    }
  };

  private visibilityHandler = () => {
    if (!document.hidden) this.loadRequests();
  };
}

