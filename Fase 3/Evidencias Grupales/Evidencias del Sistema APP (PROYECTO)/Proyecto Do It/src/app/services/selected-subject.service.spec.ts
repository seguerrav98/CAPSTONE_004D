import { TestBed } from '@angular/core/testing';

import { SelectedSubjectService } from './selected-subject.service';

describe('SelectedSubjectService', () => {
  let service: SelectedSubjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedSubjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
