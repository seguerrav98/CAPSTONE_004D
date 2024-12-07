import { Component, OnInit } from '@angular/core';
import { FeriadosService } from 'src/app/services/feriados.service';


@Component({
  selector: 'app-feriados',
  templateUrl: './feriados.page.html',
  styleUrls: ['./feriados.page.scss'],
})
export class FeriadosPage implements OnInit {

  holidays: any[] = [];
  year = new Date().getFullYear(); // Año por defecto
  countryCode = 'CL'; // País por defecto (Chile)

  constructor(private feriadosService: FeriadosService) {}

  ngOnInit() {
    this.loadHolidays();
  }
   // Cargar los feriados con el año y país seleccionados
   loadHolidays() {
    this.feriadosService.getHolidaysByYear(this.year, this.countryCode).subscribe({
      next: (data) => {
        this.holidays = data;
      },
      error: (err) => {
        console.error('Error fetching holidays:', err);
        this.holidays = []; // Limpiar la lista si hay un error
      },
    });
}
}