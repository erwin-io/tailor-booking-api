import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { Reservation } from "src/shared/entities/Reservation";
import { ReservationStatusEnum } from "src/common/enums/reservation-status.enum";
import { forkJoin } from 'rxjs'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  async getTotalDueForAMonthBy(
    month: number,
    year: number,
  ) {
    try {
      const params: any = {
        dateFrom: new Date(new Date(year, (month - 1), 1).setHours(0,0,0,0)),
        dateTo: new Date(new Date(year, month, 0).setHours(24,0,0,0)),
      };
      params.dateFrom = moment(params.dateFrom).format("YYYY-MM-DD");
      params.dateTo = moment(params.dateTo).format("YYYY-MM-DD");

      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationStatus", "rs");
        return await forkJoin([
          query
          .where(
            "r.reqCompletionDate >= :dateFrom and r.reqCompletionDate <= :dateTo AND rs.reservationStatusId = :reservationStatusId"
          )
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PENDING
          }).getCount(),
          query
          .where(
            "r.reqCompletionDate >= :dateFrom and r.reqCompletionDate <= :dateTo AND rs.reservationStatusId = :reservationStatusId"
          )
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.APPROVED
          }).getCount(),
          query
          .where(
            "r.reqCompletionDate >= :dateFrom and r.reqCompletionDate <= :dateTo AND rs.reservationStatusId = :reservationStatusId"
          )
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PROCESSED
          }).getCount(),
        ]).toPromise().then(data => {
          return {
            pending: data[0],
            approved: data[1],
            processed: data[2],
          }
        });
    } catch (e) {
      throw e;
    }
  }

  async getTotalDueByDays(
    days: number,
    date: Date,
  ) {
    try {
      const params: any = {
        dateFrom: new Date(date.setHours(0,0,0,0)),
        dateTo: new Date(date.setDate(date.getDate() + days)),
      };
      params.dateFrom = moment(params.dateFrom).format("YYYY-MM-DD");
      params.dateTo = moment(new Date(params.dateTo.setHours(0,0,0,0))).format("YYYY-MM-DD");

      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .where(
          "r.reqCompletionDate >= :dateFrom and r.reqCompletionDate <= :dateTo AND rs.reservationStatusId = :reservationStatusId"
        );
        return await forkJoin([
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PENDING
          }).getCount(),
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.APPROVED
          }).getCount(),
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PROCESSED
          }).getCount(),
        ]).toPromise().then(data => {
          return {
            pending: data[0],
            approved: data[1],
            processed: data[2],
          }
        });
    } catch (e) {
      throw e;
    }
  }

  async getTotalOverDue(
    date: Date,
  ) {
    try {
      const params: any = {
        dateDue: moment(date).format("YYYY-MM-DD")
      };

      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .where(
          "r.reqCompletionDate <= :dateDue AND rs.reservationStatusId = :reservationStatusId"
        );
        return await forkJoin([
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PENDING
          }).getCount(),
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.APPROVED
          }).getCount(),
          query
          .setParameters({
            ...params,
            reservationStatusId: ReservationStatusEnum.PROCESSED
          }).getCount(),
        ]).toPromise().then(data => {
          return {
            pending: data[0],
            approved: data[1],
            processed: data[2],
          }
        });
    } catch (e) {
      throw e;
    }
  }

  async getCustomerDashboard(customerId) {
    try {

      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.orderItems", "oi")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "oes")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c")
        .where(
          "rs.reservationStatusId = :reservationStatusId AND " + 
          "c.customerId = :customerId"
        )
        .setParameters({
          customerId,
          reservationStatusId: ReservationStatusEnum.APPROVED
        });
        return await forkJoin([
          query
          .orderBy("r.reservationId", "ASC")
          .getOne(),
          query.getCount(),
        ]).toPromise().then((data: any[]) => {
          return {
            approved: data[0],
            total: data[1],
          }
        });
    } catch (e) {
      throw e;
    }
  }
}
