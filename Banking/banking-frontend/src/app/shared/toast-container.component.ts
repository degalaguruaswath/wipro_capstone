import { Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index:1080;">
    <div *ngFor="let t of (svc.toasts$ | async)" class="toast show border-0 shadow-sm mb-2">
      <div class="toast-body"
           [ngClass]="{
             'bg-success text-white': t.type==='success',
             'bg-info text-white': t.type==='info',
             'bg-danger text-white': t.type==='danger',
             'bg-warning': t.type==='warning'
           }">
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div>{{ t.message }}</div>
          <button type="button" class="btn-close" [ngClass]="{'btn-close-white': t.type!=='warning'}"
                  (click)="svc.dismiss(t.id)"></button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ToastContainerComponent {
  constructor(public svc: ToastService) {}
}
