import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePaymentDto } from "src/core/dto/payment/payment.create.dto";
import {
  PaymentDto,
  UpdateReferenceNumberDto,
} from "src/core/dto/payment/payment.update.dto";
import { Reservation } from "src/shared/entities/Reservation";
import { Payment } from "src/shared/entities/Payment";
import { PaymentType } from "src/shared/entities/PaymentType";
import { Repository } from "typeorm";
import * as moment from "moment";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>
  ) {}

  // async findAll(): Promise<Payment[]> {
  //   try {
  //     const query: any = await this.paymentRepo.manager
  //       .createQueryBuilder("Payment", "p")
  //       //Reservation
  //       .leftJoinAndSelect("p.reservation", "r")
  //       //status
  //       .leftJoinAndSelect("r.reservationStatus", "rs")
  //       .getMany();
  //     return query;
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  async findOne(options?: any) {
    try {
      const query: any = await this.paymentRepo.manager
        .createQueryBuilder("Payment", "p")
        //Reservation
        .leftJoinAndSelect("p.reservation", "r")
        //status
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .where(options)
        .getOne();
      const result: Payment = query;
      return result;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findById(paymentId: string) {
    try {
      const payment = await this.findOne({ paymentId });
      if (!payment) {
        throw new HttpException("Payment not found", HttpStatus.NOT_FOUND);
      }
      return payment;
    } catch (e) {
      throw e;
    }
  }

  async add(createPaymentDto: CreatePaymentDto) {
    try {
      const isPaid = await this.paymentRepo.findOneBy({
        reservation: { reservationId: createPaymentDto.reservationId },
        isVoid: false,
      });

      if (isPaid) {
        throw new HttpException(
          "The reservation was already paid.",
          HttpStatus.BAD_REQUEST
        );
      }

      const payment = new Payment();
      payment.reservation = new Reservation();
      payment.reservation.reservationId = createPaymentDto.reservationId;
      payment.paymentDate = moment(createPaymentDto.paymentDate).format("YYYY-MM-DD");
      payment.paymentType = new PaymentType();
      payment.paymentType.paymentTypeId = createPaymentDto.paymentTypeId;
      payment.referenceNo = createPaymentDto.referenceNo;
      return await this.paymentRepo.save(payment);
    } catch (e) {
      throw e;
    }
  }

  async updateReferenceNumber(dto: UpdateReferenceNumberDto) {
    try {
      const payment = await this.paymentRepo.findOneBy({
        paymentId: dto.paymentId,
        isVoid: false,
      });

      if (!payment) {
        throw new HttpException(
          "There was no payment found.",
          HttpStatus.BAD_REQUEST
        );
      }
      payment.referenceNo = dto.referenceNo;
      return await this.paymentRepo.save(payment);
    } catch (e) {
      throw e;
    }
  }

  async void(dto: PaymentDto) {
    try {
      const payment = await this.paymentRepo.findOneBy({
        paymentId: dto.paymentId,
        isVoid: false,
      });

      if (!payment) {
        throw new HttpException(
          "There was no payment found.",
          HttpStatus.BAD_REQUEST
        );
      }
      payment.isVoid = true;
      return await this.paymentRepo.save(payment);
    } catch (e) {
      throw e;
    }
  }
}
