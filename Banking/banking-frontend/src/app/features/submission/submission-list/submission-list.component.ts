import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubmissionService } from '../../../services/submission.service';
import { Submission } from '../../../models/submission.model';

@Component({
  selector: 'app-submission-list',
  templateUrl: './submission-list.component.html',
  styleUrls: ['./submission-list.component.css']
})
export class SubmissionListComponent implements OnInit, OnDestroy {
  subs: Subscription | null = null;
  data: Submission[] = [];

  constructor(private service: SubmissionService) {}

  ngOnInit(): void {
    this.subs = this.service.submissions$.subscribe(list => {
      this.data = list;
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  delete(id: string) {
    this.service.delete(id);
  }

  clearAll() {
    if (confirm('Clear all local submissions?')) this.service.clearAll();
  }
}