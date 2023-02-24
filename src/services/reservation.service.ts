import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { ReservationStatusEnum } from "src/common/enums/reservation-status.enum";
import { CreateReservationDto } from "src/core/dto/reservation/reservation.create.dto";
import {
  RescheduleReservationDto,
  UpdateReservationStatusDto,
} from "src/core/dto/reservation/reservation.update.dtos";
import { ReservationViewModel } from "src/core/view-model/reservation.view-model";
import { Reservation } from "src/shared/entities/Reservation";
import { Clients } from "src/shared/entities/Clients";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { ReminderService } from "./reminder.service";
import { ReservationType } from "src/shared/entities/ReservationType";
import { ReservationStatus } from "src/shared/entities/ReservationStatus";
import { Repository } from "typeorm";
@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly appointmentRepo: Repository<Reservation>,
    private firebaseProvoder: FirebaseProvider,
    private reminderService: ReminderService
  ) {}

  async findByFilter(
    advanceSearch: boolean,
    keyword: string,
    clientName: string,
    status: string[],
    reservationType: string[],
    reservationDateFrom: Date,
    reservationDateTo: Date
  ) {
    try {
      const params: any = {
        keyword: `%${keyword}%`,
        clientName: `%${clientName}%`,
        status:
          status.length === 0
            ? ["Pending", "Approved", "Completed", "Cancelled"]
            : status,
      };

      let query = this.appointmentRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationType", "rt")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.client", "c");
      if (advanceSearch) {
        if (
          reservationDateFrom instanceof Date &&
          reservationDateFrom.toDateString() !== "Invalid Date" &&
          reservationDateTo instanceof Date &&
          reservationDateTo.toDateString() !== "Invalid Date"
        ) {
          query = query
            .where(
              "r.reservationDate >= :reservationDateFrom and r.reservationDate <= :reservationDateTo"
            )
            .andWhere("rs.name IN(:...status)");
          params.reservationDateFrom =
            moment(reservationDateFrom).format("YYYY-MM-DD");
          params.reservationDateTo =
            moment(reservationDateTo).format("YYYY-MM-DD");
        }
        query.andWhere(
          "CONCAT(c.firstName, ' ', c.middleName, ' ', c.lastName) LIKE :clientName"
        );
        if (reservationType.length > 0) {
          query = query.andWhere("rt.name IN(:...reservationType)");
          params.reservationType = reservationType;
        }

        query = query
          .orderBy("rs.reservationStatusId", "ASC")
          .addOrderBy("r.reservationDate", "ASC");
      } else {
        query = query
          .where("cast(r.reservationId as character varying) like :keyword")
          .orWhere("cast(r.reservationDate as character varying) like :keyword")
          .orWhere("rt.name like :keyword")
          .andWhere(
            "CONCAT(c.firstName, ' ', c.middleName, ' ', c.lastName) LIKE :keyword"
          )
          .orderBy("rs.reservationStatusId", "ASC")
          .addOrderBy("r.reservationDate", "ASC");
      }

      return <ReservationViewModel[]>(
        await query.setParameters(params).getMany()
      ).map((r: Reservation) => {
        return new ReservationViewModel(r);
      });
    } catch (e) {
      throw e;
    }
  }

  async getByStatus(clientId: string, status: string[]) {
    try {
      const params: any = {
        clientId,
        status:
          status.length === 0
            ? ["Pending", "Approved", "Completed", "Cancelled"]
            : status,
      };

      const query = this.appointmentRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationType", "rt")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.client", "c")
        .where("c.clientId = :clientId")
        .andWhere("rs.name IN(:...status)")
        .setParameters(params);

      return <ReservationViewModel[]>(await query.getMany()).map(
        (r: Reservation) => {
          return new ReservationViewModel(r);
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async findOne(options?: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const query = <Reservation>(
        await this.appointmentRepo.manager
          .createQueryBuilder("Reservation", "r")
          .leftJoinAndSelect("r.reservationType", "rt")
          .leftJoinAndSelect("r.reservationStatus", "rs")
          .leftJoinAndSelect("r.client", "c")
          .leftJoinAndSelect("c.user", "u")
          .where(options)
          .getOne()
      );
      return new ReservationViewModel(query);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async findById(reservationId: string) {
    try {
      const reservation = await this.findOne({ reservationId });
      if (!reservation) {
        throw new HttpException("Reservation not found", HttpStatus.NOT_FOUND);
      }
      return reservation;
    } catch (e) {
      throw e;
    }
  }

  async getReservationForADay(dateString: string) {
    try {
      dateString = moment(dateString).format("YYYY-MM-DD");
      const dateFilter = {
        from: new Date(
          moment(`${dateString} 00:00`).format("YYYY-MM-DD HH:mm")
        ),
        to: new Date(moment(`${dateString} 23:59`).format("YYYY-MM-DD HH:mm")),
      };
      const query = await this.appointmentRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .where("r.reservationDate >= :from and r.reservationDate <= :to", dateFilter)
        .andWhere("rs.name IN(:...status)", {
          status: ["Pending", "Approved"],
        })
        .getMany();
      return <ReservationViewModel[]>query.map((a: Reservation) => {
        return new ReservationViewModel(a);
      });
    } catch (e) {
      throw e;
    }
  }

  async createReservation(dto: CreateReservationDto) {
    try {
      return await this.appointmentRepo.manager.transaction(
        async (entityManager) => {
          const newReservation = new Reservation();
          const reservationDate = moment(
            `${moment(new Date(dto.reservationDate)).format("YYYY-MM-DD")} ${
              dto.time
            }`
          ).format("YYYY-MM-DD h:mm:ss a");
          newReservation.reservationDate = reservationDate;
          newReservation.time = moment(new Date(reservationDate)).format(
            "h:mm:ss a"
          );
          const reservationType = await entityManager.findOne(ReservationType, {
            where: { reservationTypeId: dto.reservationTypeId },
          });
          if (!reservationType) {
            throw new HttpException(
              "Reservation type not found!",
              HttpStatus.BAD_REQUEST
            );
          }
          newReservation.reservationType = reservationType;

          newReservation.remarks = dto.remarks;
          newReservation.client = await entityManager.findOne(Clients, {
            where: { clientId: dto.clientId },
          });
          return await entityManager.save(Reservation, newReservation);
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async updateSchedule(dto: RescheduleReservationDto) {
    try {
      const { reservationId } = dto;
      return await this.appointmentRepo.manager.transaction(
        async (entityManager) => {
          const reservation = await entityManager.findOne(Reservation, {
            where: { reservationId },
            relations: ["client", "reservationStatus", "reservationType"],
          });
          if (
            reservation.reservationStatus.reservationStatusId !==
            ReservationStatusEnum.PENDING.toString()
          ) {
            throw new HttpException(
              "Rescheduling only allowed to pending reservations",
              HttpStatus.BAD_REQUEST
            );
          }
          const reservationDate = moment(
            `${moment(new Date(dto.reservationDate)).format("YYYY-MM-DD")} ${
              dto.time
            }`
          ).format("YYYY-MM-DD h:mm:ss a");
          reservation.reservationDate = reservationDate;
          reservation.time = moment(new Date(reservationDate)).format(
            "h:mm:ss a"
          );
          return await entityManager.save(Reservation, reservation);
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async updateStatus(dto: UpdateReservationStatusDto) {
    try {
      const { reservationId, reservationStatusId } = dto;
      return await this.appointmentRepo.manager.transaction(
        async (entityManager) => {
          const reservation = await entityManager.findOne(Reservation, {
            where: { reservationId },
            relations: ["reservationStatus", "reservationType"],
          });
          if (
            reservation.reservationStatus.reservationStatusId !==
              ReservationStatusEnum.PENDING.toString() &&
            reservationStatusId === ReservationStatusEnum.PENDING.toString()
          ) {
            throw new HttpException(
              "Unable to change status, reservation is being processed",
              HttpStatus.BAD_REQUEST
            );
          }
          if (
            reservation.reservationStatus.reservationStatusId ===
              ReservationStatusEnum.PENDING.toString() &&
            reservationStatusId === ReservationStatusEnum.COMPLETED.toString()
          ) {
            throw new HttpException(
              "Unable to change status, reservation not approved",
              HttpStatus.BAD_REQUEST
            );
          }
          if (
            reservation.reservationStatus.reservationStatusId ===
              ReservationStatusEnum.COMPLETED.toString() &&
            reservationStatusId === ReservationStatusEnum.APPROVED.toString()
          ) {
            throw new HttpException(
              "Unable to change status, reservation is already completed",
              HttpStatus.BAD_REQUEST
            );
          }
          if (
            reservation.reservationStatus.reservationStatusId ===
              ReservationStatusEnum.CANCELLED.toString() &&
            reservationStatusId === ReservationStatusEnum.COMPLETED.toString()
          ) {
            throw new HttpException(
              "Unable to change status, reservation is already cancelled",
              HttpStatus.BAD_REQUEST
            );
          }
          if (
            reservation.reservationStatus.reservationStatusId ===
              ReservationStatusEnum.COMPLETED.toString() &&
            reservationStatusId === ReservationStatusEnum.CANCELLED.toString()
          ) {
            throw new HttpException(
              "Unable to change status, reservation is already completed",
              HttpStatus.BAD_REQUEST
            );
          }
          if (
            reservationStatusId === ReservationStatusEnum.CANCELLED.toString()
          ) {
            reservation.adminRemarks = dto.adminRemarks;
          }
          reservation.reservationStatus = await entityManager.findOne(
            ReservationStatus,
            {
              where: { reservationStatusId },
            }
          );
          return await entityManager.save(Reservation, reservation);
        }
      );
    } catch (e) {
      throw e;
    }
  }
}
