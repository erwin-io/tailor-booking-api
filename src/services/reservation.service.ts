import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { ReservationStatusEnum } from "src/common/enums/reservation-status.enum";
import { CreateReservationDto } from "src/core/dto/reservation/reservation.create.dto";
import {
  ApproveOrderDto,
  CompleteOrderDto,
  DeclineOrderDto,
  ProcessOrderDto,
  ReservationDto,
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
import { OrderItemAttachment } from "src/shared/entities/OrderItemAttachment";
import { v4 as uuid } from "uuid";
import { extname } from "path";
import { Files } from "src/shared/entities/Files";
import { EntityStatus } from "src/shared/entities/EntityStatus";
import { DateConstant } from "src/common/constant/date.constant";
import { NotificationService } from "./notification.service";
@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private firebaseProvoder: FirebaseProvider,
    private reminderService: ReminderService,
    private notificationService: NotificationService,
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
      params.reqCompletionDateFrom = moment(reqCompletionDateFrom, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD");
      params.reqCompletionDateTo = moment(reqCompletionDateTo, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD");
      params.status = params.status.map(x=>x.toString().toLowerCase())
      let query = this.reservationRepo.manager
        .createQueryBuilder("Reservation", "r")
        .leftJoinAndSelect("r.orderItems", "oi")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "eoi")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c")
        .leftJoinAndSelect("r.payments", "rp")
        .leftJoinAndSelect("r.staff", "s")
        .leftJoinAndSelect("rp.paymentType", "rpt");
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
          .andWhere(
            "LOWER(s.name) LIKE :keyword"
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
        .leftJoinAndSelect("r.payments", "rp")
        .leftJoinAndSelect("rp.paymentType", "rpt")
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
        .leftJoinAndSelect("oi.orderItemAttachments", "oia")
        .leftJoinAndSelect("oia.file", "oiaf")
        .leftJoinAndSelect("oi.orderItemType", "oit")
        .leftJoinAndSelect("oi.entityStatus", "eoi")
        .leftJoinAndSelect("r.reservationStatus", "rs")
        .leftJoinAndSelect("r.reservationLevel", "rl")
        .leftJoinAndSelect("r.customer", "c")
        .leftJoinAndSelect("c.user", "cu")
        .leftJoinAndSelect("r.staff", "s")
        .leftJoinAndSelect("r.payments", "rp")
        .leftJoinAndSelect("rp.paymentType", "rpt")
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

  async findByCode(reservationCode: string) {
    try {
      const reservation = await this.findOne({ reservationCode });
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
          newReservation.reqCompletionDate = moment(dto.reqCompletionDate, DateConstant.DATE_LANGUAGE).format('YYYY-MM-DD');
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

            if(o.orderItemAttachments && o.orderItemAttachments.length > 0) {
              for(let attachment of o.orderItemAttachments) {
                if (attachment) {
                  let orderItemAttachment = new OrderItemAttachment();
                  const newFileName: string = uuid();
                  const bucket = this.firebaseProvoder.app.storage().bucket();
  
                  const file = new Files();
                  file.fileName = `${newFileName}${extname(attachment.fileName)}`;
  
                  const bucketFile = bucket.file(
                    `items/attachments/${newFileName}${extname(
                      attachment.fileName
                    )}`
                  );
                  const img = Buffer.from(attachment.data, "base64");
                  await bucketFile.save(img).then(async () => {
                    const url = await bucketFile.getSignedUrl({
                      action: "read",
                      expires: "03-09-2500",
                    });
                    file.url = url[0];
                    orderItemAttachment.file = await entityManager.save(
                      Files,
                      file
                    );
                  });
                  orderItemAttachment.orderItem = newOrderItem;
                  orderItemAttachment = await entityManager.save(
                    OrderItemAttachment,
                    orderItemAttachment
                  );
                }
            }
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

  async updateStatus(reservationStatusId: string, dto: ApproveOrderDto | ProcessOrderDto | CompleteOrderDto | DeclineOrderDto | ReservationDto) {
    try {
      const { reservationId } = dto;
      return await this.reservationRepo.manager.transaction(
        async (entityManager) => {
          let reservation = await entityManager.findOne(Reservation, {
            where: { reservationId },
            relations: {
              reservationLevel: true,
              reservationStatus: true,
              customer: true,
              payments: {
                paymentType: true
              }
            },
          });
          //pending validation
          if (reservation.reservationStatus.reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is not yet approved",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is not yet processed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //pending validation end
          //approved validation
          if (reservation.reservationStatus.reservationStatusId.toString() ===ReservationStatusEnum.APPROVED.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is not yet processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already approved",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //approved validation end
          //processed validation start
          if (reservation.reservationStatus.reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already processed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //processed validation end
          //completed validation start
          if (reservation.reservationStatus.reservationStatusId.toString() ===ReservationStatusEnum.COMPLETED.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already completed",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //completed validation end
          //declined validation start
          if (reservation.reservationStatus.reservationStatusId.toString() ===ReservationStatusEnum.DECLINED.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.CANCELLED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already declined",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //declined validation end
          //cancelled validation start
          if (reservation.reservationStatus.reservationStatusId.toString() === ReservationStatusEnum.CANCELLED.toString()) {
            if (reservationStatusId.toString() === ReservationStatusEnum.PENDING.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.APPROVED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.COMPLETED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
            if (reservationStatusId.toString() === ReservationStatusEnum.DECLINED.toString()) {
              throw new HttpException(
                "Unable to change status, reservation is already cancelled",
                HttpStatus.BAD_REQUEST
              );
            }
          }
          //cancelled validation end

          if (reservationStatusId.toString() === ReservationStatusEnum.APPROVED.toString()) {
            const dateTime = (dto as ApproveOrderDto).submitItemsBeforeDateTime;
            reservation.submitItemsBeforeDateTime = new Date(moment(new Date(dateTime), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"));
          }
          if (reservationStatusId.toString() === ReservationStatusEnum.PROCESSED.toString()) {
            const { assignedStaffId, serviceFee, estCompletionDate } = (dto as ProcessOrderDto);
            if(!serviceFee || serviceFee === "" || Number.isNaN(Number(serviceFee))) {
              throw new HttpException(
                `Invalid value for service fee! `,
                HttpStatus.BAD_REQUEST
              );
            }
            if(Number(serviceFee) <= 0) {
              throw new HttpException(
                `Unable to process, please enter the service fee amount! `,
                HttpStatus.BAD_REQUEST
              );
            }
            reservation.staff = await entityManager.findOne(
              Staff,
              {
                where: { staffId: assignedStaffId },
              }
            );
            reservation.estCompletionDate = moment(new Date(estCompletionDate), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss");
            reservation.serviceFee = serviceFee;
          }
          if (reservationStatusId.toString() === ReservationStatusEnum.COMPLETED.toString()) {
            const { toPickupDateTime, otherFee } = (dto as CompleteOrderDto);
            if(!otherFee || otherFee === "" || Number.isNaN(Number(otherFee))) {
              throw new HttpException(
                `Invalid value for other fee! `,
                HttpStatus.BAD_REQUEST
              );
            }
            reservation.otherFee = otherFee;
            reservation.toPickupDateTime = new Date(moment(new Date(toPickupDateTime), DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"));
          }
          if (reservationStatusId.toString() === ReservationStatusEnum.DECLINED.toString()) {
            const { reasonToDecline } = (dto as DeclineOrderDto);
            if(!reasonToDecline || reasonToDecline === "") {
              throw new HttpException(
                `Invalid value for reasons to decline! `,
                HttpStatus.BAD_REQUEST
              );
            }
            reservation.reasonToDecline = reasonToDecline;
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
            await this.notificationService.create(reservation.reservationId.toString(), Number(reservationStatusId))
          }
          return reservation;
        }
      );
    } catch (e) {
      throw e;
    }
  }

}
