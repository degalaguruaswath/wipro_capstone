import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { MyProfileComponent } from './profile/my-profile.component';
import { EmployeeRequestsComponent } from './employee/employee-requests.component';
import { LoansComponent } from './features/loans/loans.component';
import { InsuranceComponent } from './features/insurance/insurance.component';
import { InvestmentsComponent } from './features/investments/investments.component';

import { ToastContainerComponent } from './shared/toast-container.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    MyProfileComponent,
    EmployeeRequestsComponent,
    LoansComponent,
    InsuranceComponent,
    InvestmentsComponent
  , ToastContainerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  , CommonModule, RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }