import { ToastService } from '../shared/toast.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService } from '../shared/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../shared/toast.service';
import { AccountLocalService } from '../services/account-local.service';
import { ToastService } from '../shared/toast.service';
import { AccountType, OpenAccountRequest } from '../models/open-account.model';
import { ToastService } from '../shared/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-open-account',
  templateUrl: './open-account.component.html',
  styleUrls: ['./open-account.component.css']
})
export class OpenAccountComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  savedAt?: string | null;
  valueChangesSub?: Subscription;

  accountTypes: AccountType[] = ['SAVINGS', 'CURRENT', 'SALARY'];

  constructor(private fb: FormBuilder, private store: AccountLocalService, private toast: ToastService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      holderName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      accountType: ['SAVINGS', [Validators.required]],
      initialDeposit: [0, [Validators.required, Validators.min(0)]],
    });

    // Load draft
    const draft = this.store.getDraft();
    if (draft) {
      this.form.patchValue(draft);
    }
    this.savedAt = this.store.getDraftSavedAt();

    // Auto-save draft on change
    this.valueChangesSub = this.form.valueChanges.subscribe(val => {
      this.store.setDraft(val);
      this.savedAt = this.store.getDraftSavedAt();
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: OpenAccountRequest = this.form.value as OpenAccountRequest;
    this.store.add(payload);
    this.store.clearDraft();
    this.savedAt = null;
    this.form.reset({
      accountType: 'SAVINGS',
      initialDeposit: 0
    });
    this.toast.info('Saved locally! View it on the Submissions page.');
  }

  clearDraft() {
    this.store.clearDraft();
    this.savedAt = null;
    this.form.reset({ accountType: 'SAVINGS', initialDeposit: 0 });
  }
}