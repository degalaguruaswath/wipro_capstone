import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewSubmissionComponent } from './new-submission/new-submission.component';
import { SubmissionListComponent } from './submission-list/submission-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: 'new', component: NewSubmissionComponent },
  { path: 'list', component: SubmissionListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubmissionRoutingModule {}