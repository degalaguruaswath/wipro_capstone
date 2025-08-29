import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubmissionService } from '../../../services/submission.service';
import { Submission } from '../../../models/submission.model';

@Component({
  selector: 'app-new-submission',
  templateUrl: './new-submission.component.html',
  styleUrls: ['./new-submission.component.css']
})
export class NewSubmissionComponent {
  submitting = false;
  msg = '';

  form = this.fb.group({
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    accountType: ['Savings', [Validators.required]],
    initialDeposit: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private fb: FormBuilder,
    private service: SubmissionService,
    private router: Router
  ) {}

  private uid() {
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    // If you prefer: crypto.randomUUID() in modern browsers.
  }

  submit() {
    if (this.form.invalid) {
      this.msg = 'Please fix the errors in the form.';
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const v = this.form.getRawValue();
    const payload: Submission = {
      id: this.uid(),
      holderName: v.holderName!,
      phone: v.phone!,
      email: v.email!,
      accountType: v.accountType!,
      initialDeposit: Number(v.initialDeposit!),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage via service
    this.service.upsert(payload);
    this.msg = 'Saved locally.';
    this.submitting = false;
    this.form.reset({ accountType: 'Savings', initialDeposit: 0 });

    // Navigate to list
    this.router.navigate(['/submission/list']);
  }
}
