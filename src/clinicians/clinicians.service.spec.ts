import { Test, TestingModule } from '@nestjs/testing';
import { CliniciansService } from './clinicians.service';

describe('CliniciansService', () => {
  let service: CliniciansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CliniciansService],
    }).compile();

    service = module.get<CliniciansService>(CliniciansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
