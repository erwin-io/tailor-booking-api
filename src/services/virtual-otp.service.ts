import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { generateOTP } from 'src/common/utils/utils';
import { OtpResponseViewModel } from 'src/core/view-model/otp-response.view-model';
import { ConfigService } from "@nestjs/config";
import { SendOTPDto } from 'src/core/dto/otp/otp.create.dto';

@Injectable()
export class VirtualOtpService {
    constructor(private readonly config: ConfigService) {

    }
    async generateAPIResponse(dto: SendOTPDto) {
        try {
            const otp = await generateOTP();
            const response = new OtpResponseViewModel();
            response.messages = [{
                  messageId: `${Math.floor(1000000 + Math.random() * 900000)}${Math.floor(1000000 + Math.random() * 900000)}${Math.floor(1000000 + Math.random() * 900000)}`,
                  status: {
                      description: this.config.get<string>("OTP_DESCFORMAT").toString().replace("{OTP}", otp.toString()),
                      groupId: 1,
                      groupName: "PENDING",
                      id: 26,
                      name: "PENDING_ACCEPTED"
                  },
                  to: dto.messages[0].destinations[0].to
              }
            ]
          return response;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
