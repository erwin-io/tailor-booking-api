import { Test, TestingModule } from '@nestjs/testing';
import { VirtualOtpController } from './virtual-otp.controller';

describe('VirtualOtpController', () => {
  let controller: VirtualOtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VirtualOtpController],
    }).compile();

    controller = module.get<VirtualOtpController>(VirtualOtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
