import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shuffle, first, get } from 'lodash';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { parse, stringify } from 'qs';
import { BehaviorSubject, Subject } from 'rxjs';
import { range } from 'lodash';

@Component({
  selector: 'app-root',
  template: `
    <div class="bg-gray-500">
        <p class="text-xs text-white text-center">
            Made by <a class="text-blue-300" href="https://daz.is">Daz</a> 
            with photos from <a class="text-blue-300" href="https://unsplash.com">Unsplash</a></p>
    </div>
      <div class="max-w-sm mx-auto mt-8 flex justify-between">
          <button (click)="prevPage()">
              <svg class="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M3.828 9l6.071-6.071-1.414-1.414L0 10l.707.707 7.778 7.778 1.414-1.414L3.828 11H20V9H3.828z"/>
              </svg>
          </button>
          <div>
              <ul class="flex items-center">
                  <li *ngFor="let i of pages" 
                      class="mx-1">
                      <button class="w-3 h-3 rounded-full" (click)="setPage(i)"
                              [class.bg-blue-400]="page === i"
                              [class.bg-gray-200]="page !== i"></button>
                  </li>
              </ul>
          </div>
          <button (click)="nextPage()">
              <svg class="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M16.172 9l-6.071-6.071 1.414-1.414L20 10l-.707.707-7.778 7.778-1.414-1.414L16.172 11H0V9z"/>
              </svg>
          </button>
      </div>
      <div class="max-w-sm mx-auto mt-4 flex">
          <button class="flex-1 mx-1 rounded-full uppercase text-xs font-medium tracking-wide px-2 py-1"
                  [class.bg-gray-200]="currentTerm !== t"
                  [class.bg-blue-600]="currentTerm === t"
                  [class.text-gray-900]="currentTerm !== t"
                  [class.text-white]="currentTerm === t"
                  *ngFor="let t of terms" (click)="setTerm(t)">{{ t.label }}</button>
      </div>
      <div *ngIf="faceUrl$ | async as faces" class="flex justify-center flex-wrap max-w-md mx-auto mt-6">
          <img *ngFor="let face of faces" [src]="face" alt="" class="w-24 h-24 rounded-full m-1">
      </div>
  `,
  styles: [`
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  faceUrl$;
  page = 0;
  maxPage = 10;

  get pages() {
    return range(this.maxPage);
  }

  currentTerm = {
    label: 'face',
    term: 'face'
  };
  terms = [
    {
      label: 'face',
      term: 'face'
    },
    {
      label: 'man',
      term: 'man face'
    },
    {
      label: 'woman',
      term: 'woman face'
    },
    {
      label: 'lgbt',
      term: 'lgbt face'
    },
    {
      label: 'happy',
      term: 'happy face'
    },
    {
      label: 'sad',
      term: 'sad face'
    }
  ];

  _refreshPage$ = new BehaviorSubject(0);
  destroy$ = new Subject();

  constructor(
    private readonly http: HttpClient
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const baseUrl = 'https://unsplash.com/napi/search/photos';
    this.faceUrl$ = this._refreshPage$
      .pipe(
        takeUntil(this.destroy$),
        map(page => `${ proxyUrl }${baseUrl}?query=${this.currentTerm.term}&xp=&per_page=20&page=${ page + 1 }`),
        switchMap(url => this.http.get<any>(url)),
        map(({ results }) => results.map(result => {
          const [url, qs] = get(result, 'urls.thumb').split('?');
          return url + '?' + stringify({
            ...qs,
            auto: 'format',
            fit: 'facearea',
            h: 256,
            w: 256,
            q: 80,
            facepad: 2
          });
        })),
        map(faces => shuffle(faces))
      );
  }

  setTerm(term) {
    this.currentTerm = term;
    this._refreshPage$.next(this.page);
  }

  setPage(i) {
    this.page = i;
    this._refreshPage$.next(this.page);
  }

  nextPage() {
    this.page = (this.page + 1) % this.maxPage;
    this._refreshPage$.next(this.page);
  }

  prevPage() {
    this.page = (this.page === 0) ? this.maxPage - 1 : (this.page - 1) % this.maxPage;
    this._refreshPage$.next(this.page);
  }

}
