import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenAccountComponent } from './open-account/open-account.component';
import { SubmissionsComponent } from './submissions/submissions.component';

const routes: Routes = [
  { path: 'open', component: OpenAccountComponent },
  { path: 'submissions', component: SubmissionsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'open' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}