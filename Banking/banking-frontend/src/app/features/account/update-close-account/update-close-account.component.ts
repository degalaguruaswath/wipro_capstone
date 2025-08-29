import { ToastService } from '../shared/toast.service';
import { Component } from '@angular/core';
import { ToastService } from '../shared/toast.service';
import { FormBuilder } from '@angular/forms';
import { ToastService } from '../shared/toast.service';
import { AccountService } from '../../../services/account.service';
import { ToastService } from '../shared/toast.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-update-close-account',
  templateUrl: './update-close-account.component.html'
})
export class UpdateCloseAccountComponent {
  form = this.fb.group({
    accountNumber: this.fb.control<string | null>(null),
    email: this.fb.control<string | null>(null),
    phone: this.fb.control<string | null>(null),
  });

  constructor(private fb: FormBuilder, private api: AccountService, private toast: ToastService) {}

  update() {
    const raw = this.form.getRawValue();
    const accountNumber = (raw.accountNumber || '').trim();
    if (!accountNumber) return this.toast.info('Enter account number');

    // ✅ Convert nulls to undefined and omit empty strings
    const changes: Partial<Account> = {
      ...(raw.email && raw.email.trim() ? { email: raw.email.trim() } : {}),
      ...(raw.phone && raw.phone.trim() ? { phone: raw.phone.trim() } : {}),
    };

    if (!Object.keys(changes).length) return this.toast.info('Nothing to update');

    this.api.updateAccount(accountNumber, changes).subscribe({
      next: () => this.toast.info('Updated!'),
      error: (e) => this.toast.info('Update failed: ' + (e?.error?.message || e.message))
    });
  }

  close() {
    const acc = (this.form.value.accountNumber || '').trim();
    if (!acc) return this.toast.info('Enter account number');
    this.api.closeAccount(acc).subscribe({
      next: () => this.toast.info('Closed!'),
      error: (e) => this.toast.info('Close failed: ' + (e?.error?.message || e.message))
    });
  }
}
