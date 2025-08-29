import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
export const CORE_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];