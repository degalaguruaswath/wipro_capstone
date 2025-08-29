import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService, Role } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Only ADMIN or CUSTOMER may see the main dashboard
    if (this.auth.hasRole('ADMIN', 'CUSTOMER')) return true;

    // If EMPLOYEE or not logged in, redirect
    if (this.auth.hasRole('EMPLOYEE')) {
      this.router.navigateByUrl('/employee');   // put your employee page route here
    } else {
      this.router.navigateByUrl('/login');
    }
    return false;
  }
}
