import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService, Account } from '../services/account.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
})
export class AccountDetailComponent implements OnInit {
  loading = false;
  error = '';
  account?: Account;

  // ⬇️ put the EXACT account_no you created in Postman
  private accountNo = 'PUT_ACCOUNT_NO_HERE';

  constructor(private accounts: AccountService) {}

  ngOnInit(): void {
    this.loading = true;
    this.accounts.getAccount(this.accountNo).subscribe({
      next: (acc) => { this.account = acc; this.loading = false; },
      error: (err) => {
        this.error = err?.error?.detail || err?.message || 'Failed to load account';
        this.loading = false;
        console.error('Account load error', err);
      },
    });
  }
}
