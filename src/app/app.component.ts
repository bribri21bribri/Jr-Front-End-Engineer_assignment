import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { CurrentSearch, SEARCH_CONFIG, SearchService } from './services/search.service';

interface SearchResult {
  num_found: number;
  docs: {
    title: string;
    author_name: string[];
    cover_edition_key: string;
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatPaginatorModule,
  ],
  // BONUS: Use DI to update the config of SearchService to update page size
  providers: [
    SearchService,
    { provide: SEARCH_CONFIG, useValue: { defaultPageSize: 5 } },
  ],
})
export class AppComponent {
  private $http = inject(HttpClient);
  // TODO: Create a SearchService and use DI to inject it
  private searchService = inject(SearchService);

  // TODO: Implement this observable to call the searchBooks() function
  // Hint: Use RxJS operators to solve these issues
  searchResults$ = this.searchService.currentSearch$.pipe(
    startWith(null),
    switchMap((search) => {
      if (search && search.searchText) return this.searchBooks(search);
      return of(null);
    }),
    shareReplay()
  );
  currentSearch$ = this.searchService.currentSearch$.asObservable();

  onSearchInputChange(event: Event) {
    this.searchService.searchText = (event.target as HTMLInputElement).value;
  }

  searchBooks(currentSearch: CurrentSearch): Observable<SearchResult> {
    const { searchText, pageSize, page } = currentSearch;

    const searchQuery = searchText.split(' ').join('+').toLowerCase();

    return this.$http.get<SearchResult>(
      `https://openlibrary.org/search.json?q=${searchQuery}&page=${page}&limit=${pageSize}`
    );
  }

  onSummit(searchForm: FormGroup) {
    if (!searchForm.valid) {
      return;
    }
    this.searchService.submit();
  }

  pageChange(pageNo: number) {
    this.searchService.pageChange(pageNo);
  }

  get searchText() {
    return this.searchService.searchText;
  }
}
