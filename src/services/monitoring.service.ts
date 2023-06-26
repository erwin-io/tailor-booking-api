/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { UserTypeEnum } from 'src/common/enums/user-type.enum';
import { Payment } from 'src/shared/entities/Payment';
import { Reservation } from 'src/shared/entities/Reservation';
import { Users } from 'src/shared/entities/Users';
import { Repository } from 'typeorm';

@Injectable()
export class MonitoringService {
    constructor(
    @InjectRepository(Reservation) private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>
    ) {}
    async getTotalCustomers() {
        return this.usersRepo.count({
            where: {
                userType: {
                    userTypeId: UserTypeEnum.CUSTOMER.toString()
                }
            }
        })
    }

    async getTotalCorporatePeople() {
        return this.usersRepo.count({
            where: {
                userType: {
                    userTypeId: UserTypeEnum.STAFF.toString()
                }
            }
        })
    }

    async getTotalSales(dateFrom: Date, dateTo: Date, assignedUserId?: string) {
      try {
        
        dateFrom = new Date(dateFrom.setHours(0,0,0,0));
        dateTo = new Date(new Date(dateTo.setDate(dateTo.getDate() + 1)).setHours(0,0,0,0));
        let sales = 0;
        const query = await this.paymentRepo.manager
          .createQueryBuilder("Payment", "p")
          .leftJoinAndSelect("p.reservation", "r")
          .leftJoinAndSelect("r.customer", "c")
          .leftJoinAndSelect("r.staff", "s")
          .leftJoinAndSelect("s.user", "u")
          .leftJoinAndSelect("p.paymentType", "pt");
        let user;
        if(assignedUserId !== undefined && assignedUserId !== null && assignedUserId !== "" && Number(assignedUserId) > 0) {
            user = await this.usersRepo.findOneBy({userId: assignedUserId })
        }
        if(user) {
            const result = <Payment[]>await query
            .where(`
            (p.paymentDate between :dateFrom AND :dateTo) AND
            p.isVoid = false AND
            u.userId = :userId
            `)
            .setParameters({
              dateFrom,
              dateTo,
              userId: user.userId
          }).getMany();
          sales = result.map(x=> {
            return Number(x.reservation.serviceFee) + Number(x.reservation.otherFee);
          }).reduce((partialSum, a) => Number(partialSum) + Number(a), 0)

        } else {
            const result = <Payment[]>await query
            .where(`
            (p.paymentDate between :dateFrom AND :dateTo) AND
            p.isVoid = false
            `)
            .setParameters({
              dateFrom,
              dateTo,
          }).getMany();
          
          sales = result.map(x=> {
            return Number(x.reservation.serviceFee) + Number(x.reservation.otherFee);
          }).reduce((partialSum, a) => Number(partialSum) + Number(a), 0)
        }
        return sales;
      } catch (e) {
        throw e;
      }
    }
    
    async getTotalClosedBooking(dateFrom: Date, dateTo: Date, assignedUserId?: string) {
      try {
        
        dateFrom = new Date(dateFrom.setHours(0,0,0,0));
        dateTo = new Date(new Date(dateTo.setDate(dateTo.getDate() + 1)).setHours(0,0,0,0));
        let count = 0;
        const query = await this.reservationRepo.manager
            .createQueryBuilder("Reservation", "r")
            .leftJoinAndSelect("r.reservationStatus", "rs")
            .leftJoinAndSelect("r.payments", "p")
            .leftJoinAndSelect("r.staff", "s")
            .leftJoinAndSelect("s.user", "u");
        let user;
        if(assignedUserId !== undefined && assignedUserId !== null && assignedUserId !== "" && Number(assignedUserId) > 0) {
            user = await this.usersRepo.findOneBy({userId: assignedUserId })
        }
        if(user) {
            count = await query
            .where(`
            (p.paymentDate between :dateFrom AND :dateTo) AND
            p.isVoid = false AND
            u.userId = :userId AND
            rs.reservationStatusId = :reservationStatusId
            `)
            .setParameters({
              dateFrom,
              dateTo,
              isVoid: false,
              userId: user.userId,
              reservationStatusId: ReservationStatusEnum.COMPLETED.toString()
          }).getCount();
        } else {
            count = await query
            .where(`
            (p.paymentDate between :dateFrom AND :dateTo) AND
            p.isVoid = false AND
            rs.reservationStatusId = :reservationStatusId
            `)
            .setParameters({
              dateFrom,
              dateTo,
              isVoid: false,
              reservationStatusId: ReservationStatusEnum.COMPLETED.toString()
          }).getCount();
        }
        return count;
      } catch (e) {
        throw e;
      }
    }
    
    async getReservationMonitoring(dateFrom: Date, dateTo: Date, assignedUserId?: string) {
      try {
        
        dateFrom = new Date(dateFrom.setHours(0,0,0,0));
        dateTo = new Date(new Date(dateTo.setDate(dateTo.getDate() + 1)).setHours(0,0,0,0));
        let user;
        let queryGetClosedBooking;
        let querySales;
        if(assignedUserId !== undefined && assignedUserId !== null && assignedUserId !== "" && Number(assignedUserId) > 0) {
            user = await this.usersRepo.findOneBy({userId: assignedUserId })
        }
        if(user && user.staff && user.staff.staffId) {
          querySales = `
            SELECT SUM(r."ServiceFee") + SUM(r."OtherFee") AS sales, p."PaymentDate" as date from dbo."Reservation" r
            LEFT JOIN dbo."Payment" p ON r."ReservationId" = p."ReservationId"
            WHERE r."ReservationStatusId" = ${ReservationStatusEnum.COMPLETED.toString()}
            AND p."PaymentDate" between '${moment(dateFrom).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(dateTo).format("YYYY-MM-DD HH:mm:ss")}'
            AND p."IsVoid" = false
            AND r."StaffId" = ${user.staff.staffId}
            GROUP BY p."PaymentDate"
          `;
          queryGetClosedBooking = `
            SELECT COUNT(r."ReservationId") AS sales, p."PaymentDate" as date from dbo."Reservation" r
            LEFT JOIN dbo."Payment" p ON r."ReservationId" = p."ReservationId"
            WHERE r."ReservationStatusId" = ${ReservationStatusEnum.COMPLETED.toString()}
            AND p."PaymentDate" between '${moment(dateFrom).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(dateTo).format("YYYY-MM-DD HH:mm:ss")}'
            AND p."IsVoid" = false
            AND r."StaffId" = ${user.userId}
            GROUP BY p."PaymentDate"
          `;
        } else {
          querySales = `
            SELECT SUM(r."ServiceFee") + SUM(r."OtherFee") AS sales, p."PaymentDate" as date from dbo."Reservation" r
            LEFT JOIN dbo."Payment" p ON r."ReservationId" = p."ReservationId"
            WHERE r."ReservationStatusId" = ${ReservationStatusEnum.COMPLETED.toString()}
            AND p."PaymentDate" between '${moment(dateFrom).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(dateTo).format("YYYY-MM-DD HH:mm:ss")}'
            AND p."IsVoid" = false
            GROUP BY p."PaymentDate"
          `;
          queryGetClosedBooking = `
            SELECT COUNT(r."ReservationId") AS sales, p."PaymentDate" as date from dbo."Reservation" r
            LEFT JOIN dbo."Payment" p ON r."ReservationId" = p."ReservationId"
            WHERE r."ReservationStatusId" = ${ReservationStatusEnum.COMPLETED.toString()}
            AND p."PaymentDate" between '${moment(dateFrom).format("YYYY-MM-DD HH:mm:ss")}' AND '${moment(dateTo).format("YYYY-MM-DD HH:mm:ss")}'
            AND p."IsVoid" = false
            GROUP BY p."PaymentDate"
          `;
        }
        
        return await forkJoin([
          this.reservationRepo.manager
          .query(querySales),
          this.reservationRepo.manager
          .query(queryGetClosedBooking)
        ]).toPromise();
      } catch (e) {
        throw e;
      }
    }
}
