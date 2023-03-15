import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { ReservationStatusEnum } from "src/common/enums/reservation-status.enum";
import { CreateReservationDto } from "src/core/dto/reservation/reservation.create.dto";
import {
  ProcessOrderDto,
  UpdateReservationStatusDto,
} from "src/core/dto/reservation/reservation.update.dtos";
import { ReservationViewModel } from "src/core/view-model/reservation.view-model";
import { Reservation } from "src/shared/entities/Reservation";
import { Customers } from "src/shared/entities/Customers";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { ReminderService } from "./reminder.service";
import { ReservationStatus } from "src/shared/entities/ReservationStatus";
import { Repository } from "typeorm";
import { ReservationLevel } from "src/shared/entities/ReservationLevel";
import { OrderItem } from "src/shared/entities/OrderItem";
import { OrderItemType } from "src/shared/entities/OrderItemType";
import { Staff } from "src/shared/entities/Staff";
import { EntityStatusEnum } from "src/common/enums/entity-status.enum";
import {
  ReportTypeConstant
} from "../common/constant/daashboard.constant";
import { Notifications } from "src/shared/entities/Notifications";
import { NotificationDescriptionConstant, NotificationTitleConstant } from "src/common/constant/notifications.constant";
import { MessagingDevicesResponse } from "firebase-admin/lib/messaging/messaging-api";
import { formatId } from "src/common/helper/env.helper";
@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private firebaseProvoder: FirebaseProvider,
    private reminderService: ReminderService
  ) {}

  async findByFilter(
    advanceSearch: boolean,
    keyword: string,
    customerName: string,
    status: string[],
    reqCompletionDateFrom: Date,
    reqCompletionDateTo: Date
  ) {
    try {
      const params: any = {
        keyword: `%${keyword}%`,
        customerName: `%${customerName.toLowerCase()}%`,
        status:
          status.length === 0
            ? ["Pending",
            "Approved",
            "Processed",
            "Completed",
            "Declined",
            "Cancelled"]
            : status,
            entityStatusId: EntityStatusEnum.ACTIVE.toString()
      };
      if (
        (!(reqCompletionDateFrom instanceof Date) ||
        reqCompletionDateFrom.toDateString().includes("Invalid Date"))
      ) {
        reqCompletionDateFrom = new Date(new Date().setHours(0,0,0,0))
      }
      if (
        (!(reqCompletionDateTo instanceof Date) ||
        reqCompletionDateTo.toDateString().includes("Invalid Date"))
      ) {
        reqCompletionDateTo = new Date(new Date().setHours(0,0,0,0))
      }
      params.reqCompletionDateFrom = moment(reqCompletionDateFrom).format("YYYY-MM-DD");
      params.reqCompletionDateTo = moment(reqCompletionDateTo).format("YYYY-MM-DD");
      params.status = params.status.map(x=>x.toString().toLowerCase())
      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.orderItems", "oi")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "eoi")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c");
      if (advanceSearch) {
        query = query
          .where(
            "LOWER(rs.name) IN(:...status) AND " + 
            "CONCAT(LOWER(c.firstName), ' ', LOWER(c.lastName)) LIKE :customerName AND " + 
            "eoi.entityStatusId = :entityStatusId "
            )
          .orderBy("rs.reservationStatusId", "ASC")
          .addOrderBy("r.reservationId", "ASC");
      } else {
        query = query
          .where("LOWER(cast(r.reservationId as character varying)) like :keyword")
          .orWhere("LOWER(cast(r.reqCompletionDate as character varying)) like :keyword")
          .orWhere("LOWER(rl.name) like :keyword")
          .andWhere(
            "CONCAT(LOWER(c.firstName), ' ', LOWER(c.lastName)) LIKE :keyword"
          )
          .orderBy("rs.reservationStatusId", "ASC")
          .addOrderBy("r.reservationId", "ASC");
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

  async getByStatus(customerId: string, status: string[]) {
    try {
      const params: any = {
        customerId,
        status:
          status.length === 0
            ? ["Pending",
            "Approved",
            "Processed",
            "Completed",
            "Declined",
            "Cancelled"]
            : status,
            entityStatusId: EntityStatusEnum.ACTIVE.toString()
      };
      // params.status = params.status.map(x=>x.toString().toLowerCase())
      const query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.orderItems", "oi")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "eoi")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c")
        .where("c.customerId = :customerId")
        .andWhere("rs.name IN(:...status)")
        // .andWhere("eoi.entityStatusId = :entityStatusId")
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
        await this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.orderItems", "oi")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "eoi")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c")
        .leftJoinAndSelect("c.user", "cu")
        .leftJoinAndSelect("r.staff", "s")
        .leftJoinAndSelect("s.user", "su")
          .where(options)
          // .andWhere("eoi.entityStatusId = :entityStatusId", { entityStatusId : EntityStatusEnum.ACTIVE.toString() })
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

  async createReservation(dto: CreateReservationDto) {
    try {
      return await this.reservationRepo.manager.transaction(
        async (entityManager) => {
          let newReservation = new Reservation();
          newReservation.reqCompletionDate = moment(dto.reqCompletionDate).format('YYYY-MM-DD');
          newReservation.description = dto.description;
          newReservation.customer = await entityManager.findOne(Customers, {
            where: { customerId: dto.customerId },
          });
          newReservation.reservationLevel = await entityManager.findOne(ReservationLevel, {
            where: { reservationLevelId: dto.reservationLevelId },
          });
          newReservation = await entityManager.save(Reservation, newReservation);
          if(!dto.orderItems || dto.orderItems.length === 0) {
            throw new HttpException(
              "Items are required!",
              HttpStatus.BAD_REQUEST
            );
          }
          for(let o of dto.orderItems) {
            let newOrderItem = new OrderItem();
            newOrderItem.orderItemType = await entityManager.findOne(OrderItemType, {
              where: { orderItemTypeId: o.orderItemTypeId },
            });
            if(Number(o.quantity) <= 0) {
              throw new HttpException(
                `Invalid quantity ${newOrderItem.orderItemType.name}!`,
                HttpStatus.BAD_REQUEST
              );
            }
            newOrderItem.quantity = o.quantity.toString();
            newOrderItem.reservation = newReservation;
            newOrderItem.remarks = o.remarks;
            newOrderItem = await entityManager.save(OrderItem, newOrderItem);
            if(!newOrderItem) {
              throw new HttpException(
                "Error saving Items!",
                HttpStatus.BAD_REQUEST
              );
            }

          }
          return await entityManager.findOne(Reservation, {
            where: { reservationId: newReservation.reservationId },
            relations: {
              reservationLevel: true,
              reservationStatus: true,
              orderItems: {
                orderItemType: true
              }
            }
          });
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async updateStatus(dto: UpdateReservationStatusDto) {
    try {
      const { reservationId, reservationStatusId } = dto;
      return await this.reservationRepo.manager.transaction(
        async (entityManager) => {
          let reservation = await entityManager.findOne(Reservation, {
            where: { reservationId },
            relations: {
              reservationLevel: true,
              reservationStatus: true,
              customer: true
            },
          });
          if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
            throw new HttpException(
              "Not allowed to processed!",
              HttpStatus.BAD_REQUEST
            );
          }
          //pending validation
          if (reservation.reservationStatus.reservationStatusId ===ReservationStatusEnum.PENDING.toString()) {
            if (reservationStatusId === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is not yet processed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //pending validation end
          //approved validation
          if (reservation.reservationStatus.reservationStatusId ===ReservationStatusEnum.APPROVED.toString()) {
            if (reservationStatusId === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is not yet processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //approved validation end
          //processed validation start
          if (reservation.reservationStatus.reservationStatusId ===ReservationStatusEnum.PROCESSED.toString()) {
            if (reservationStatusId === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //processed validation end
          //completed validation start
          if (reservation.reservationStatus.reservationStatusId ===ReservationStatusEnum.COMPLETED.toString()) {
            if (reservationStatusId === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //completed validation end
          //declined validation start
          if (reservation.reservationStatus.reservationStatusId ===ReservationStatusEnum.DECLINED.toString()) {
            if (reservationStatusId === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //declined validation end
          //cancelled validation start
          if (reservation.reservationStatus.reservationStatusId === ReservationStatusEnum.CANCELLED.toString()) {
            if (reservationStatusId === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //cancelled validation end

          if (
            reservationStatusId === ReservationStatusEnum.DECLINED.toString()
          ) {
            reservation.adminRemarks = dto.adminRemarks;
          }
          reservation.reservationStatus = await entityManager.findOne(
            ReservationStatus,
            {
              where: { reservationStatusId },
            }
          );
          reservation = await entityManager.save(Reservation, reservation);
          if(Number(reservationStatusId) === ReservationStatusEnum.APPROVED ||
          Number(reservationStatusId) === ReservationStatusEnum.COMPLETED ||
          Number(reservationStatusId) === ReservationStatusEnum.DECLINED)
          {
            let notif = new Notifications();
            notif.reservation = reservation;
            notif.customer = await entityManager.findOne(Customers, {
              where: { customerId: reservation.customer.customerId },
            });
            notif.date = new Date();
            if (Number(dto.reservationStatusId) === ReservationStatusEnum.APPROVED) {
              notif.title = NotificationTitleConstant.RESERVATION_APPROVED;
              notif.description =
                NotificationDescriptionConstant.RESERVATION_APPROVED.replace(
                  "{0}",
                  `${formatId(reservation.reservationId, 5)}`
                );
            } else if (Number(dto.reservationStatusId) === ReservationStatusEnum.COMPLETED) {
              notif.title = NotificationTitleConstant.RESERVATION_COMPLETED;
              notif.description =
                NotificationDescriptionConstant.RESERVATION_COMPLETED.replace(
                  "{0}",
                  `${formatId(reservation.reservationId, 5)}`
                );
            } else if (Number(dto.reservationStatusId) === ReservationStatusEnum.DECLINED) {
              notif.title = NotificationTitleConstant.RESERVATION_DECLINED;
              notif.description =
                NotificationDescriptionConstant.RESERVATION_DECLINED.replace(
                  "{0}",
                  `${formatId(reservation.reservationId, 5)}`
                );
            }
            notif = await entityManager.save(Notifications, notif);
            if (!notif) {
              throw new HttpException(
                "Error adding notifications!",
                HttpStatus.BAD_REQUEST
              );
            } else {
              const notificationId = notif.notificationId;
              notif = <Notifications>await entityManager
                .createQueryBuilder("Notifications", "n")
                .leftJoinAndSelect("n.customer", "c")
                .leftJoinAndSelect("c.user", "u")
                .leftJoinAndSelect("n.reservation", "r")
                .where("n.notificationId = :notificationId", {
                  notificationId,
                })
                .getOne();
              if (
                notif.customer.user.firebaseToken &&
                notif.customer.user.firebaseToken !== ""
              ) {
                return await this.firebaseProvoder.app
                  .messaging()
                  .sendToDevice(
                    notif.customer.user.firebaseToken,
                    {
                      notification: {
                        title: notif.title,
                        body: notif.description,
                        sound: "notif_alert",
                      },
                    },
                    {
                      priority: "high",
                      timeToLive: 60 * 24,
                      android: { sound: "notif_alert" },
                    }
                  )
                  .then((response: MessagingDevicesResponse) => {
                    console.log("Successfully sent message:", response);
                    return reservation;
                  })
                  .catch((error) => {
                    throw new HttpException(
                      `Error sending notif! ${error.message}`,
                      HttpStatus.BAD_REQUEST
                    );
                  });
              }
            }
          } else {
            return reservation;
          }
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async processOrder(dto: ProcessOrderDto) {
    return await this.reservationRepo.manager.transaction(
      async (entityManager) => {
        const { reservationId, assignedStaffId } = dto;
        let reservation = await entityManager.findOne(Reservation, {
          where: { reservationId },
          relations: {
            reservationLevel: true,
            reservationStatus: true,
            customer: true
          },
        });
        reservation.staff = await entityManager.findOne(
          Staff,
          {
            where: { staffId: assignedStaffId },
          }
        );
        reservation.reservationStatus = await entityManager.findOne(
          ReservationStatus,
          {
            where: { reservationStatusId: ReservationStatusEnum.PROCESSED.toString() },
          }
        );
        reservation.estCompletionDate = moment(dto.estCompletionDate).format("YYYY-MM-DD");
        reservation = await entityManager.save(Reservation, reservation);
        let notif = new Notifications();
        notif.reservation = reservation;
        notif.customer = await entityManager.findOne(Customers, {
          where: { customerId: reservation.customer.customerId },
        });
        notif.title = NotificationTitleConstant.RESERVATION_PROCESSED;
        notif.description =
          NotificationDescriptionConstant.RESERVATION_PROCESSED.replace(
            "{0}",
            `${moment(reservation.reqCompletionDate).format(
              "MMM DD, YYYY"
            )}`
          );
        notif.date = new Date();
        notif = await entityManager.save(Notifications, notif);
        if (!notif) {
          throw new HttpException(
            "Error adding notifications!",
            HttpStatus.BAD_REQUEST
          );
        } else {
          const notificationId = notif.notificationId;
          notif = <Notifications>await entityManager
            .createQueryBuilder("Notifications", "n")
            .leftJoinAndSelect("n.customer", "c")
            .leftJoinAndSelect("c.user", "u")
            .leftJoinAndSelect("n.reservation", "r")
            .where("n.notificationId = :notificationId", {
              notificationId,
            })
            .getOne();
          if (
            notif.customer.user.firebaseToken &&
            notif.customer.user.firebaseToken !== ""
          ) {
            await this.firebaseProvoder.app
              .messaging()
              .sendToDevice(
                notif.customer.user.firebaseToken,
                {
                  notification: {
                    title: notif.title,
                    body: notif.description,
                    sound: "notif_alert",
                  },
                },
                {
                  priority: "high",
                  timeToLive: 60 * 24,
                  android: { sound: "notif_alert" },
                }
              )
              .then((response: MessagingDevicesResponse) => {
                console.log("Successfully sent message:", response);
                return reservation;
              })
              .catch((error) => {
                throw new HttpException(
                  `Error sending notif! ${error.message}`,
                  HttpStatus.BAD_REQUEST
                );
              });
          }
        }
    });
  }
}
