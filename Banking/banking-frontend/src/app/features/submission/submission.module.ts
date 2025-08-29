import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SubmissionRoutingModule } from './submission-routing.module';
import { NewSubmissionComponent } from './new-submission/new-submission.component';
import { SubmissionListComponent } from './submission-list/submission-list.component';

@NgModule({
  declarations: [
    NewSubmissionComponent,
    SubmissionListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SubmissionRoutingModule
  ]
})
export class SubmissionModule {}