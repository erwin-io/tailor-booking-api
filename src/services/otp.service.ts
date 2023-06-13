import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { SendOTPDto } from 'src/core/dto/otp/otp.create.dto';
import { url } from 'inspector';
import { firstValueFrom, catchError } from 'rxjs';
import { ConfigService } from "@nestjs/config";
import { OtpResponseViewModel } from 'src/core/view-model/otp-response.view-model';

@Injectable()
export class OtpService {
    constructor(private readonly httpService: HttpService,
        private readonly config: ConfigService) {}

    async send(dto: SendOTPDto) {
        try {
            const url = `http://localhost:3000/api/v1/virtual-otp/generateAPIResponse`;//fake api for testing
            // const url = `${this.config.get<string>("OTP_BASEURL")}/sms/2/text/advanced`;
            const authorization = `${this.config.get<string>("OTP_AUTHTYPE")} ${this.config.get<string>("OTP_AUTHKEY")}`;
            const result = await firstValueFrom(
                this.httpService
                  .post<any>(url, dto,{
                    responseType: "json",
                    headers: {
                        "Authorization": authorization,
                        "Content-Type": "application/json",
                    },
                  })
                  .pipe(
                    catchError((error) => {
                        let message = "";
                        if(error.response.data["requestError"] && 
                        error.response.data["requestError"].serviceException) {
                            message = error.response.data["requestError"].serviceException.text;
                        }
                        if(!message || message === "") {
                            message = "Bad request"
                        }
                      throw new HttpException(
                        message,
                        HttpStatus.BAD_REQUEST
                      );
                    })
                  )
            );
            return result.data as OtpResponseViewModel;
        } catch(ex) {
            throw ex;
        }
    }
}
