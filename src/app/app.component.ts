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
      <div class="bg-gray-200 px-2 py-1 flex justify-between">
          <p class="text-xs text-gray-800">
              Made by <a class="font-medium text-blue-900 hover:bg-blue-200" href="https://daz.is">Daz</a>
              with photos from <a class="font-medium text-blue-900 hover:bg-blue-200" href="https://unsplash.com">Unsplash</a>
              using <a class="font-medium text-blue-900 hover:bg-blue-200" href="https://tailwindcss.com/">Tailwind CSS</a>
              and <a class="font-medium text-blue-900 hover:bg-blue-200" href="https://angular.io/">Angular</a>.
          </p>
          <div class="ml-2">
              <a class="text-blue-900 flex items-center hover:bg-blue-200" href="https://github.com/darrenmothersele/avatar-maker">
                  <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 1000">
                      <path d="M620 564c17.333 0 32.333 8.667 45 26 12.667 17.333 19 38.667 19 64s-6.333 46.667-19 64-27.667 26-45 26c-18.667 0-34.333-8.667-47-26-12.667-17.333-19-38.667-19-64s6.333-46.667 19-64 28.333-26 47-26m226-234c49.333 53.333 74 118 74 194 0 49.333-5.667 93.667-17 133s-25.667 71.333-43 96-38.667 46.333-64 65-48.667 32.333-70 41c-21.333 8.667-45.667 15.333-73 20s-48 7.333-62 8c-14 .667-29 1-45 1-4 0-16 .333-36 1s-36.667 1-50 1c-13.333 0-30-.333-50-1s-32-1-36-1c-16 0-31-.333-45-1s-34.667-3.333-62-8-51.667-11.333-73-20-44.667-22.333-70-41-46.667-40.333-64-65-31.667-56.667-43-96C5.667 617.667 0 573.333 0 524c0-76 24.667-140.667 74-194-5.333-2.667-5.667-29.333-1-80s15.667-97.333 33-140c61.333 6.667 137.333 41.333 228 104 30.667-8 72.667-12 126-12 56 0 98 4 126 12 41.333-28 81-50.667 119-68s65.667-27.333 83-30l26-6c17.333 42.667 28.333 89.333 33 140 4.667 50.667 4.333 77.333-1 80M462 844c110.667 0 194.333-13.333 251-40s85-81.333 85-164c0-48-18-88-54-120-18.667-17.333-40.333-28-65-32s-62.333-4-113 0-85.333 6-104 6h-2-2c-21.333 0-49-1.333-83-4s-60.667-4.333-80-5c-19.333-.667-40.333 1.667-63 7s-41.333 14.667-56 28c-34.667 30.667-52 70.667-52 120 0 82.667 28 137.333 84 164s139.333 40 250 40h4M302 564c17.333 0 32.333 8.667 45 26 12.667 17.333 19 38.667 19 64s-6.333 46.667-19 64-27.667 26-45 26c-18.667 0-34.333-8.667-47-26-12.667-17.333-19-38.667-19-64s6.333-46.667 19-64 28.333-26 47-26"/>
                  </svg>
                  <span class="font-medium ml-1 text-xs">GitHub</span>
              </a>
          </div>
      </div>
      <div class="max-w-sm mx-auto mt-8 flex justify-between items-center">
          <button (click)="prevPage()">
              <svg class="mt-2 fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M3.828 9l6.071-6.071-1.414-1.414L0 10l.707.707 7.778 7.778 1.414-1.414L3.828 11H20V9H3.828z"/>
              </svg>
          </button>
          <div>
              <ul class="flex items-center">
                  <li *ngFor="let i of pages"
                      class="mx-1">
                      <button class="w-3 h-3 rounded-full" (click)="setPage(i)"
                              [class.bg-blue-400]="page === i"
                              [class.bg-gray-200]="page !== i"
                              [class.hover:bg-gray-400]="page !== i"></button>
                  </li>
              </ul>
          </div>
          <button (click)="nextPage()">
              <svg class="mt-2 fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M16.172 9l-6.071-6.071 1.414-1.414L20 10l-.707.707-7.778 7.778-1.414-1.414L16.172 11H0V9z"/>
              </svg>
          </button>
      </div>
      <div class="max-w-sm mx-auto mt-6 flex">
          <button class="flex-1 mx-1 rounded-full uppercase text-xs font-medium tracking-wide px-2 py-1"
                  [class.bg-gray-200]="currentTerm.term !== t.term"
                  [class.bg-blue-600]="currentTerm.term === t.term"
                  [class.text-gray-900]="currentTerm.term !== t.term"
                  [class.text-white]="currentTerm.term === t.term"
                  [class.hover:bg-gray-400]="currentTerm.term !== t.term"
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
        map(page => `${ proxyUrl }${ baseUrl }?query=${ this.currentTerm.term }&xp=&per_page=20&page=${ page + 1 }`),
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
