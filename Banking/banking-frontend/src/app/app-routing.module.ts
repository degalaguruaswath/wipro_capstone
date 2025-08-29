import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/auth.guard';

import { MyProfileComponent } from './profile/my-profile.component';
import { EmployeeRequestsComponent } from './employee/employee-requests.component';
import { LoansComponent } from './features/loans/loans.component';
import { InsuranceComponent } from './features/insurance/insurance.component';
import { InvestmentsComponent } from './features/investments/investments.component';

const routes: Routes = [
  { path: 'employee', redirectTo: 'employee/requests', pathMatch: 'full' },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'employee/requests', component: EmployeeRequestsComponent, canActivate: [AuthGuard] },
  { path: 'loans', component: LoansComponent, canActivate: [AuthGuard] },
  { path: 'insurance', component: InsuranceComponent, canActivate: [AuthGuard] },
  { path: 'investments', component: InvestmentsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'auth/login' }
];
@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}