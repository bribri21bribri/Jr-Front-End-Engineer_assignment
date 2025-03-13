import { Injectable, InjectionToken, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

interface SearchConfig {
  defaultPageSize?: number;
}

export interface CurrentSearch {
  searchText: string;
  pageSize: number;
  page: number;
}

export interface ISearchService {
  searchText: string;
  pageSize: number;
  page: number;
  currentSearch$: BehaviorSubject<CurrentSearch | null>;
  submit(): void;
}

// BONUS: Use DI to update the config of SearchService to update page size
export const SEARCH_CONFIG = new InjectionToken<SearchConfig>('page size', {
  providedIn: 'root',
  factory: () => ({defaultPageSize: 10}),
});

@Injectable()
export class SearchService implements ISearchService {
  searchText = '';
  pageSize = inject(SEARCH_CONFIG).defaultPageSize!;
  page = 1;
  currentSearch$ = new BehaviorSubject<CurrentSearch | null>(null);

  private cancel$ = new Subject<void>();
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this._initFromUrl();
  }

  // BONUS: Keep the current search params in the URL that allow users to refresh the page and search again
  private _initFromUrl() {
    this.route.queryParams
    .pipe(takeUntil(this.cancel$))
    .subscribe((params) => {
      if (params['searchText']) {
        const page = Number(params['page']);
        const pageNo = isNaN(page) ? 1 : page;
        
        this.searchText = params['searchText'];
        this.page = pageNo;

        this.currentSearch$.next({
          searchText: this.searchText,
          pageSize: this.pageSize,
          page: this.page,
        });
        this.cancel$.next();
      }
    });
  }

  submit() {
    this.page = 1;
    this.currentSearch$.next({
      searchText: this.searchText,
      pageSize: this.pageSize,
      page: this.page,
    });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchText: this.searchText, page: 1 },
      replaceUrl: true,
    });
  }

  pageChange(pageNo: number) {
    this.page = pageNo;
    const currentSearchValue = this.currentSearch$.getValue();
    if (currentSearchValue) {
      this.currentSearch$.next({
        ...currentSearchValue,
        page: this.page,
      });

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { searchText: this.searchText, page: this.page },
        replaceUrl: true,
      });
    }
  }
}
