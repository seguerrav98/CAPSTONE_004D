import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode = new BehaviorSubject<boolean>(false); // Definimos el BehaviorSubject como booleano

  constructor() {
    this.setInitialTheme(); // Establecemos el tema inicial al cargar el servicio
  }

  // Método para establecer el tema inicial basado en localStorage
  setInitialTheme() {
    const storedTheme = localStorage.getItem('darkMode'); // Obtenemos el valor del localStorage
    const darkMode = storedTheme ? JSON.parse(storedTheme) : false; // Parseamos el valor a booleano, si no existe se asigna false
    this.setTheme(darkMode); // Establecemos el tema
  }

  // Método para cambiar el tema
  setTheme(darkMode: boolean) {
    // Cambiamos el atributo 'color-theme' del body según el valor del tema
    document.body.setAttribute('color-theme', darkMode ? 'dark' : 'light');
    
    this.darkMode.next(darkMode); // Emitimos el nuevo valor al BehaviorSubject
    localStorage.setItem('darkMode', JSON.stringify(darkMode)); // Guardamos el valor en localStorage
  }
}
