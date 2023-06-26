import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { Payment } from "src/shared/entities/Payment";
import { SalesViewModel } from "src/core/view-model/sales.view-model";
import { Reservation } from "src/shared/entities/Reservation";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>) {}

  async getSalesAdvance(dateFrom: Date, dateTo: Date) {
    try {
      
      dateFrom = new Date(dateFrom.setHours(0,0,0,0));
      dateTo = new Date(new Date(dateTo.setDate(dateTo.getDate() + 1)).setHours(0,0,0,0));
      const result = <Payment[]>await this.paymentRepo.manager
        .createQueryBuilder("Payment", "p")
        .leftJoinAndSelect("p.reservation", "r")
        .leftJoinAndSelect("r.customer", "c")
        .leftJoinAndSelect("r.staff", "s")
        .leftJoinAndSelect("p.paymentType", "pt")
        .where(`
        (p.paymentDate between :dateFrom AND :dateTo) AND
        p.isVoid = false
        `)
        .setParameters({
          dateFrom,
          dateTo,
          isVoid: false
        })
        .getMany();
      const sales: SalesViewModel[] = <any>result.map(x=> {
        return {
          reservationCode: x.reservation.reservationCode,
          customerName: x.reservation.customer.firstName + ' ' + x.reservation.customer.lastName,
          tailorName: x.reservation.staff.name,
          paymentId: x.paymentId,
          paymentDate: x.paymentDate,
          referenceNo: x.referenceNo,
          isVoid: x.isVoid,
          paymentType: x.paymentType.name,
          amount: Number(x.reservation.serviceFee) + Number(x.reservation.otherFee),
        }
      })
      return sales;
    } catch (e) {
      throw e;
    }
  }
}
