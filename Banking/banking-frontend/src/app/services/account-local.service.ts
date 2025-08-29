import { Injectable } from '@angular/core';
import { AccountSubmission, OpenAccountRequest } from '../models/open-account.model';

const SUBMISSIONS_KEY = 'account_submissions';
const DRAFT_KEY = 'account_draft';
const DRAFT_SAVED_AT_KEY = 'account_draft_savedAt';

@Injectable({ providedIn: 'root' })
export class AccountLocalService {

  // ---- Draft helpers ----
  getDraft(): Partial<OpenAccountRequest> | null {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
    // savedAt can be read via getDraftSavedAt()
  }

  setDraft(value: Partial<OpenAccountRequest>) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    localStorage.setItem(DRAFT_SAVED_AT_KEY, new Date().toISOString());
  }

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_SAVED_AT_KEY);
  }

  getDraftSavedAt(): string | null {
    return localStorage.getItem(DRAFT_SAVED_AT_KEY);
  }

  // ---- Submissions helpers ----
  getAll(): AccountSubmission[] {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  add(request: OpenAccountRequest): AccountSubmission {
    const all = this.getAll();
    const submission: AccountSubmission = {
      ...request,
      id: cryptoRandomId(),
      submittedAt: new Date().toISOString(),
    };
    all.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
    return submission;
  }

  delete(id: string) {
    const all = this.getAll().filter(x => x.id !== id);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
  }

  clearAll() {
    localStorage.removeItem(SUBMISSIONS_KEY);
  }

  exportJson(): Blob {
    const all = this.getAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    return blob;
  }
}

// Lightweight ID generator (no external deps)
function cryptoRandomId(): string {
  // try browser crypto if available
  const arr = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}