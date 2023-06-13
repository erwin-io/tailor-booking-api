import { Module } from '@nestjs/common';
import { VirtualOtpController } from './virtual-otp.controller';
import { VirtualOtpService } from 'src/services/virtual-otp.service';

@Module({
  controllers: [VirtualOtpController],
  providers: [VirtualOtpService],
  exports: [VirtualOtpService],
})
export class VirtualOtpModule {}
