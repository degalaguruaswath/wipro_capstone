import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DepositWithdrawComponent } from './deposit-withdraw/deposit-withdraw.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { TransferComponent } from './transfer/transfer.component';

@NgModule({
  declarations: [
    DepositWithdrawComponent,
    TransactionHistoryComponent,
    TransferComponent,
  ],
  imports: [
    CommonModule,          // date pipe lives here for feature modules
    FormsModule,
    ReactiveFormsModule,   // enables [formGroup]
  ],
  exports: [
    DepositWithdrawComponent,
    TransactionHistoryComponent,
    TransferComponent,
  ],
})
export class TransactionModule {}