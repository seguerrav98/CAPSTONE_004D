import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {
  private baseUrl = 'https://date.nager.at/api/v3/PublicHolidays'; // Usamos el proxy configurado

  constructor(private http: HttpClient) {}

  // Obtener feriados del año en curso
  getCurrentYearHolidays(countryCode: string): Observable<any[]> {
    const currentYear = new Date().getFullYear();
    const url = `${this.baseUrl}/${currentYear}/${countryCode}`;
    return this.http.get<any[]>(url);
  }

  // Obtener feriados de un año específico
  getHolidaysByYear(year: number, countryCode: string): Observable<any[]> {
    const url = `${this.baseUrl}/${year}/${countryCode}`;
    return this.http.get<any[]>(url);
  }
}