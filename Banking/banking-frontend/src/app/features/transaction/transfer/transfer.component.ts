import { ToastService } from '../shared/toast.service';
import { Component } from '@angular/core';
import { ToastService } from '../shared/toast.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../shared/toast.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html'
})
export class TransferComponent {
  processing = false;

  form = this.fb.group({
    fromAccount: ['', Validators.required],
    toAccount: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    remarks: ['']
  });

  constructor(private fb: FormBuilder, private api: TransactionService, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.processing = true;

    const dto = this.form.getRawValue();
    this.api.transfer({
      fromAccount: dto.fromAccount!,
      toAccount: dto.toAccount!,
      amount: Number(dto.amount),
      remarks: dto.remarks || undefined
    }).subscribe({
      next: () => { this.processing = false; this.toast.success('Transfer successful'); },
      error: (e) => { this.processing = false; this.toast.info('Transfer failed: ' + (e?.error?.message || e.message)); }
    });
  }
}