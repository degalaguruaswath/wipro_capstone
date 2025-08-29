import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'banking-frontend';
  ngOnInit(): void {
    try {
      if (!localStorage.getItem('v2_cleared')) {
        localStorage.removeItem('bank_accounts_v1');
        localStorage.removeItem('bank_transactions_v1');
        localStorage.setItem('v2_cleared','1');
      }
    } catch {}
  }
}