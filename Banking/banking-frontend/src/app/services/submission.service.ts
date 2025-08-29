import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Submission } from '../models/submission.model';

const STORAGE_KEY = 'app_submissions_v1';

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private _submissions$ = new BehaviorSubject<Submission[]>(this.load());
  submissions$ = this._submissions$.asObservable();

  private load(): Submission[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Submission[] : [];
    } catch {
      return [];
    }
  }

  private persist(list: Submission[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this._submissions$.next(list);
  }

  upsert(submission: Submission) {
    const list = this.load();
    const idx = list.findIndex(s => s.id === submission.id);
    if (idx >= 0) list[idx] = submission; else list.unshift(submission);
    this.persist(list);
  }

  delete(id: string) {
    const list = this.load().filter(s => s.id !== id);
    this.persist(list);
  }

  getById(id: string) {
    return this.load().find(s => s.id === id) || null;
  }

  clearAll() {
    this.persist([]);
  }
}