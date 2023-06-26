import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notifications } from "src/shared/entities/Notifications";
import { Repository } from "typeorm";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { Customers } from "src/shared/entities/Customers";
import { EntityStatus } from "src/shared/entities/EntityStatus";
import { MessagingDevicesResponse } from "firebase-admin/lib/messaging/messaging-api";
import { NotificationTitleConstant, NotificationDescriptionConstant } from "src/common/constant/notifications.constant";
import { formatId } from "src/common/helper/env.helper";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { Reservation } from "src/shared/entities/Reservation";
import { ReservationStatusEnum } from "src/common/enums/reservation-status.enum";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationsRepo: Repository<Notifications>,
    private firebaseProvider: FirebaseProvider,
  ) {}
  async getAllByCustomerIdPage(customerId: string, options: IPaginationOptions) {
    const queryBuilder = this.notificationsRepo.manager
      .createQueryBuilder()
      .select("n")
      .from(Notifications, "n")
      .leftJoinAndSelect("n.reservation", "r")
      .leftJoinAndSelect("r.reservationStatus", "rs")
      .leftJoinAndSelect("r.reservationLevel", "rl")
      .leftJoinAndSelect("n.customer", "c")
      .where("c.customerId= :customerId", { customerId });
    queryBuilder.orderBy("n.notificationId", "DESC"); // Or whatever you need to do

    return paginate<Notifications>(queryBuilder, options);
  }

  async create(reservationId: string, reservationStatusId: ReservationStatusEnum) {
    await this.notificationsRepo.manager.transaction(
      async (entityManager) => {
        let notif = new Notifications();
        const reservation = await entityManager.findOne(Reservation, {
          where: { reservationId },
          relations: {
            reservationLevel: true,
            reservationStatus: true,
            customer: true
          }
        });
        if(!reservation) {
          throw new HttpException(
            "Error adding notifications, reservation not found!",
            HttpStatus.BAD_REQUEST
          );
        }
        notif.reservation = reservation;
        notif.customer = await entityManager.findOne(Customers, {
          where: { customerId: notif.reservation.customer.customerId },
        });
        if(reservationStatusId === ReservationStatusEnum.APPROVED) {
          notif.title = NotificationTitleConstant.RESERVATION_APPROVED;
          notif.description =
            NotificationDescriptionConstant.RESERVATION_APPROVED.replace(
              "{0}",
              `${reservation.reservationCode}`
            );
        }
        else if(reservationStatusId === ReservationStatusEnum.PROCESSED) {
          notif.title = NotificationTitleConstant.RESERVATION_PROCESSED;
          notif.description =
            NotificationDescriptionConstant.RESERVATION_PROCESSED.replace(
              "{0}",
              `${reservation.reservationCode}`
            );
        }
        else if(reservationStatusId === ReservationStatusEnum.COMPLETED) {
          notif.title = NotificationTitleConstant.RESERVATION_COMPLETED;
          notif.description =
            NotificationDescriptionConstant.RESERVATION_COMPLETED.replace(
              "{0}",
              `${reservation.reservationCode}`
            );
        }
        else if(reservationStatusId === ReservationStatusEnum.DECLINED) {
          notif.title = NotificationTitleConstant.RESERVATION_DECLINED;
          notif.description =
            NotificationDescriptionConstant.RESERVATION_DECLINED.replace(
              "{0}",
              `${reservation.reservationCode}`
            );
        }
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
            await this.firebaseProvider.app
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

  async updateReadStatus(dto) {
    try {
      return await this.notificationsRepo.manager.transaction(
        async (entityManager) => {
          const notification = await entityManager.findOne(Notifications, {
            where: { notificationId: dto.notificationId },
            relations: ["customer"],
          });
          if (!notification) {
            throw new HttpException(
              "Notification not found",
              HttpStatus.NOT_FOUND
            );
          }
          notification.isRead = true;
          await entityManager.save(notification);

          const isRead = false;
          const queryBuilder = entityManager
            .createQueryBuilder()
            .select("n")
            .from(Notifications, "n")
            .leftJoinAndSelect("n.reservation", "r")
            .leftJoinAndSelect("n.customer", "c")
            .where("c.customerId = :customerId", {
              customerId: notification.customer.customerId,
            })
            .andWhere("n.isRead = :isRead", { isRead });
          return { total: await queryBuilder.getCount() };
        }
      );
    } catch (e) {
      throw e;
    }
  }

  async getTotalUnreadByCustomerId(customerId: string) {
    const isRead = false;
    const queryBuilder = this.notificationsRepo.manager
      .createQueryBuilder()
      .select("n")
      .from(Notifications, "n")
      .leftJoinAndSelect("n.reservation", "r")
      .leftJoinAndSelect("n.customer", "c")
      .where("c.customerId = :customerId", { customerId })
      .andWhere("n.isRead = :isRead", { isRead });
    return { total: await queryBuilder.getCount() };
  }
}
