import { EntityStatus } from "../entities/EntityStatus";
import { UserType } from "../entities/UserType";
import { Gender } from "../entities/Gender";
import { Staff } from "../entities/Staff";
import { Users } from "../entities/Users";
import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Roles } from "../entities/Roles";
import { Messages } from "../entities/Messages";
import { Notifications } from "../entities/Notifications";
import { GatewayConnectedUsers } from "../entities/GatewayConnectedUsers";
import { Reminder } from "../entities/Reminder";
import { Files } from "../entities/Files";
import { UserProfilePic } from "../entities/UserProfilePic";
import { Reservation } from "../entities/Reservation";
import { ReservationStatus } from "../entities/ReservationStatus";
import { Customers } from "../entities/Customers";
import { ReservationLevel } from "../entities/ReservationLevel";
import { OrderItem } from "../entities/OrderItem";
import { OrderItemType } from "../entities/OrderItemType";
import { OrderItemAttachment } from "../entities/OrderItemAttachment";
import { Payment } from "../entities/Payment";
import { PaymentType } from "../entities/PaymentType";
import { ActivityLog } from "../entities/ActivityLog";
import { ActivityType } from "../entities/ActivityType";
import { UserVerification } from "../entities/UserVerification";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    const ssl = this.config.get<string>("SSL");
    let config: TypeOrmModuleOptions = {
      type: "postgres",
      host: this.config.get<string>("DATABASE_HOST"),
      port: Number(this.config.get<number>("DATABASE_PORT")),
      database: this.config.get<string>("DATABASE_NAME"),
      username: this.config.get<string>("DATABASE_USER"),
      password: this.config.get<string>("DATABASE_PASSWORD"),
      entities: [
        Users,
        Roles,
        Customers,
        Staff,
        Gender,
        UserType,
        EntityStatus,
        Notifications,
        Messages,
        GatewayConnectedUsers,
        Reminder,
        Files,
        UserProfilePic,
        Reservation,
        ReservationStatus,
        ReservationLevel,
        OrderItem,
        OrderItemType,
        OrderItemAttachment,
        Payment,
        PaymentType,
        ActivityLog,
        ActivityType,
        UserVerification,
      ],
      synchronize: false,// never use TRUE in production!
      ssl: ssl.toLocaleLowerCase().includes("true"),
      extra: {

      }
    }
    if(config.ssl) {
      config.extra.ssl = {
        require: true,
        rejectUnauthorized: false,
      }
    }
    return config;
  }
}
