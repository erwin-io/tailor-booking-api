import { Test, TestingModule } from '@nestjs/testing';
import { VirtualOtpService } from './virtual-otp.service';

describe('VirtualOtpService', () => {
  let service: VirtualOtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VirtualOtpService],
    }).compile();

    service = module.get<VirtualOtpService>(VirtualOtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
