import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeriadosPage } from './feriados.page';

describe('FeriadosPage', () => {
  let component: FeriadosPage;
  let fixture: ComponentFixture<FeriadosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FeriadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
