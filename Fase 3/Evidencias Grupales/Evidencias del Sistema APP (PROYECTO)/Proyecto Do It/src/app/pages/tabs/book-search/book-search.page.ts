import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BookService } from 'src/app/services/book.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.page.html',
  styleUrls: ['./book-search.page.scss'],
})
export class BookSearchPage {
  searchQuery: string = '';
  books: any[] = [];
  query: string = '';

  constructor(private bookService: BookService, private http: HttpClient, private utilsSvc: UtilsService, private translate: TranslateService) {}

  searchBooks(query: string) {
    this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
      .subscribe({
        next: (data: any) => {
          // Procesa los datos aquí
          console.log(data);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 429) {
            this.utilsSvc.presentToast({
              message: this.translate.instant('SEALIMITE'),  // Variable traducida
              color: 'danger',
              icon: 'alert-circle-outline',
              duration: 3000
            });
          } else {
            console.error('Error fetching books:', error);
            this.utilsSvc.presentToast({
              message: this.translate.instant('ERRORLIBROS'),  // Variable traducida
              color: 'danger',
              icon: 'alert-circle-outline',
              duration: 3000
            });
          }
        },
        complete: () => {
          console.log('Búsqueda de libros completada.');
        }
      });
  }
  
  
}

