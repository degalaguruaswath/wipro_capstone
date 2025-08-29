import { ToastService } from '../shared/toast.service';
import { Component } from '@angular/core';
import { ToastService } from '../shared/toast.service';
import { FormBuilder } from '@angular/forms';
import { ToastService } from '../shared/toast.service';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../shared/toast.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html'
})
export class TransactionHistoryComponent {
  loading = false;
  data: Transaction[] = [];

  form = this.fb.group({ accountNumber: [''] });

  constructor(private fb: FormBuilder, private api: TransactionService, private toast: ToastService) {}

  fetch() {
    const acc = this.form.value.accountNumber || '';
    if (!acc.trim()) return this.toast.info('Enter account number');
    this.loading = true;
    this.api.history(acc).subscribe({
      next: (rows) => { this.data = rows || []; this.loading = false; },
      error: (e) => { this.loading = false; this.toast.info('Failed: ' + (e?.error?.message || e.message)); }
    });
  }
}
