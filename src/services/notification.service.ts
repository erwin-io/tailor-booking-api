import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notifications } from "src/shared/entities/Notifications";
import { Repository } from "typeorm";
import { IPaginationOptions, paginate } from "nestjs-typeorm-paginate";
import { Customers } from "src/shared/entities/Customers";
import { EntityStatus } from "src/shared/entities/EntityStatus";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationsRepo: Repository<Notifications>
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

  // async addAppointmentNotification(
  //   dto: {
  //     appointment: Appointment;
  //     customer: Customers;
  //     date: Date;
  //     title: string;
  //     description: string;
  //   }[]
  // ) {
  //   return await this.notificationsRepo.manager.transaction(
  //     async (entityManager) => {
  //       const notifications = dto.map((x) => {
  //         const notification = new Notifications();
  //         notification.appointment = x.appointment;
  //         notification.customer = x.customer;
  //         notification.date = x.date;
  //         notification.title = x.title;
  //         notification.description = x.description;
  //         notification.isRead = false;
  //         return notification;
  //       });
  //       const res = await entityManager
  //         .createQueryBuilder()
  //         .insert()
  //         .into(Notifications)
  //         .values(notifications)
  //         .execute();
  //       return res;
  //     }
  //   );
  // }

  // async addRemindersToAll(dto: {
  //   date: Date;
  //   title: string;
  //   description: string;
  // }) {
  //   try {
  //     return await this.notificationsRepo.manager.transaction(
  //       async (entityManager) => {
  //         const customers = await entityManager.find(Customers, {
  //           where: {
  //             user: {
  //               entityStatus: { entityStatusId: "1" },
  //               enable: true,
  //             },
  //           },
  //           relations: ["user"],
  //         });
  //         const notifications = customers.map((x) => {
  //           const notification = new Notifications();
  //           notification.customer = x;
  //           notification.date = dto.date;
  //           notification.title = dto.title;
  //           notification.description = dto.description;
  //           notification.isRead = false;
  //           return notification;
  //         });

  //         const res = await entityManager
  //           .createQueryBuilder()
  //           .insert()
  //           .into(Notifications)
  //           .values(notifications)
  //           .execute();
  //         return res;
  //       }
  //     );
  //   } catch (e) {
  //     throw e;
  //   }
  // }

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
