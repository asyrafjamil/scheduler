import { Test, TestingModule } from '@nestjs/testing';
import { CliniciansController } from './clinicians.controller';
import { CliniciansService } from './clinicians.service';

describe('CliniciansController', () => {
  let controller: CliniciansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CliniciansController],
      providers: [CliniciansService],
    }).compile();

    controller = module.get<CliniciansController>(CliniciansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
