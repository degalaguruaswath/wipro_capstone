import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';

import { OpenAccountComponent } from './open-account/open-account.component';
import { SubmissionsComponent } from './submissions/submissions.component';

@NgModule({
  declarations: [OpenAccountComponent, SubmissionsComponent],
  imports: [CommonModule, ReactiveFormsModule, AccountRoutingModule],
})
export class AccountModule {}