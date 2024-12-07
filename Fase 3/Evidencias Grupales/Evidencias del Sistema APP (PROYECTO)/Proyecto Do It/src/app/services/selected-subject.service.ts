import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedSubjectService {
  // Usamos un BehaviorSubject para mantener el estado actual de la asignatura seleccionada
  private selectedSubjectSource = new BehaviorSubject<string | null>(null);
  selectedSubject$ = this.selectedSubjectSource.asObservable();

  constructor() {}

  // Método para actualizar el ID de la asignatura seleccionada
  setSelectedSubject(subjectId: string | null) {
    this.selectedSubjectSource.next(subjectId);
  }
}
