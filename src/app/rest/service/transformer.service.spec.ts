/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TransformerService } from './transformer.service';

describe('TransformerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransformerService]
    });
  });

  it('should ...', inject([TransformerService], (service: TransformerService) => {
    expect(service).toBeTruthy();
  }));
});
