import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";

@Injectable()
export class DashboardService {
  constructor(
  ) {}

  // async getVetYearlyAppointmentSummary(staffId, year: number) {
  //   try {
  //     const appointmentDateFrom = new Date(`${year}-01-01`);
  //     const appointmentDateTo = new Date(year, 11, 31);
  //     let query = await this.appointmentRepo.manager
  //       .createQueryBuilder("Appointment", "a")
  //       //staff
  //       .leftJoinAndSelect("a.staff", "s")
  //       //status
  //       .leftJoinAndSelect("a.appointmentStatus", "as");

  //     if (
  //       appointmentDateFrom instanceof Date &&
  //       appointmentDateFrom.toDateString() !== "Invalid Date" &&
  //       appointmentDateTo instanceof Date &&
  //       appointmentDateTo.toDateString() !== "Invalid Date"
  //     ) {
  //       query = query.andWhere(
  //         "a.appointmentDate between :appointmentDateFrom and :appointmentDateTo",
  //         { appointmentDateFrom, appointmentDateTo }
  //       );
  //       // params.appointmentDateFrom =
  //       //   moment(appointmentDateFrom).format("YYYY-MM-DD");
  //       // params.appointmentDateTo =
  //       //   moment(appointmentDateTo).format("YYYY-MM-DD");
  //     }
  //     return {
  //       pending: await query
  //         .andWhere("s.staffId =:staffId", { staffId })
  //         .andWhere("as.appointmentStatusId =:appointmentStatusId", {
  //           appointmentStatusId: "1",
  //         })
  //         .getCount(),
  //       approved: await query
  //         .andWhere("s.staffId =:staffId", { staffId })
  //         .andWhere("as.appointmentStatusId =:appointmentStatusId", {
  //           appointmentStatusId: "2",
  //         })
  //         .getCount(),
  //       completed: await query
  //         .andWhere("s.staffId =:staffId", { staffId })
  //         .andWhere("as.appointmentStatusId =:appointmentStatusId", {
  //           appointmentStatusId: "3",
  //         })
  //         .getCount(),
  //       cancelled: await query
  //         .andWhere("s.staffId =:staffId", { staffId })
  //         .andWhere("as.appointmentStatusId =:appointmentStatusId", {
  //           appointmentStatusId: "4",
  //         })
  //         .getCount(),
  //     };
  //   } catch (e) {
  //     throw e;
  //   }
  // }
}
