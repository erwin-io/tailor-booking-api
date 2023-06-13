import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomResponse } from 'src/common/helper/customresponse.helpers';
import { JwtAuthGuard } from 'src/core/auth/jwt.auth.guard';
import { SendOTPDto } from 'src/core/dto/otp/otp.create.dto';
import { VirtualOtpService } from 'src/services/virtual-otp.service';

@ApiTags("virtual-otp")
@Controller("virtual-otp")
export class VirtualOtpController {
    constructor(private readonly virtualOtpService: VirtualOtpService) {}
    
    @Post("generateAPIResponse")
    async generateAPIResponse(@Body() dto: SendOTPDto) {
        try {
            const response = await this.virtualOtpService.generateAPIResponse(dto);
            return {
                ...response
            };
        } catch (e) {
            return {
                requestError: {
                    serviceException: {
                        messageId: "BAD_REQUEST",
                        text: e.message !== undefined ? e.message : e,
                    }
                }
            };
        }
    }

}
