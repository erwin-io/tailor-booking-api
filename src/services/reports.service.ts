import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import * as moment from "moment";
import { ConfigService } from "@nestjs/config";
import { Payment } from "src/shared/entities/Payment";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly httpService: HttpService,
    @Inject(ConfigService)
    private readonly config: ConfigService
  ) {}

  async getPaymentsInvoice(paymentId: string) {
    try {
      const receipt = <Payment>await this.paymentRepo.manager
        .createQueryBuilder("Payment", "p")
        .leftJoinAndSelect("p.reservation", "r")
        .leftJoinAndSelect("r.customer", "c")
        .leftJoinAndSelect("p.paymentType", "pt")
        .where("p.paymentId = :paymentId", {paymentId})
        .andWhere("p.isVoid = :isVoid", { isVoid: false })
        .getOne();

      const data = {
        name: "Invoice",
        paymentId,
        paymentDate: receipt.paymentDate,
        serviceFee: receipt.reservation.serviceFee,
        otherFee: receipt.reservation.otherFee,
        fullName: receipt.reservation.customer.firstName + ' ' + receipt.reservation.customer.lastName,
        totalAmount : Number(receipt.reservation.serviceFee) + Number(receipt.reservation.otherFee),
      };
      const params = {
        template: {
          name: "payments-receipt",
        },
        data: data,
      };
      const url = this.config.get<string>("JSREPORTS_URL").toString();
      const username = this.config.get<string>("JSREPORTS_USERNAME").toString();
      const password = this.config.get<string>("JSREPORTS_PASSWORD").toString();
      const result = await firstValueFrom(
        this.httpService
          .post<any>(url, JSON.stringify(params), {
            auth: {
              username,
              password,
            },
            responseType: "stream",
            headers: {
              "Content-Type": "application/json",
            },
          })
          .pipe(
            catchError((error) => {
              throw new HttpException(
                error.response.data,
                HttpStatus.BAD_REQUEST
              );
            })
          )
      );
      return result.data;
    } catch (e) {
      throw e;
    }
  }
}
