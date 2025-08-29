import { ToastService } from '../shared/toast.service';
import { Component } from '@angular/core';
import { ToastService } from '../shared/toast.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../shared/toast.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-deposit-withdraw',
  templateUrl: './deposit-withdraw.component.html'
})
export class DepositWithdrawComponent {
  processing = false;
  form = this.fb.group({
    type: ['DEPOSIT', Validators.required],
    accountNumber: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    remarks: ['']
  });

  constructor(private fb: FormBuilder, private api: TransactionService, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.processing = true;
    const { type, accountNumber, amount, remarks } = this.form.getRawValue();

    const call = type === 'DEPOSIT'
      ? this.api.deposit({ accountNumber: accountNumber!, amount: Number(amount), remarks: remarks || undefined })
      : this.api.withdraw({ accountNumber: accountNumber!, amount: Number(amount), remarks: remarks || undefined });

    call.subscribe({
      next: () => { this.processing = false; this.toast.success(`${type} successful`); },
      error: (e) => { this.processing = false; this.toast.info(`${type} failed: ` + (e?.error?.message || e.message)); }
    });
  }
}