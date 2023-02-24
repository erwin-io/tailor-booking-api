import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clients } from "./Clients";
import { EntityStatus } from "./EntityStatus";

@Index("pk_notifications_1061578820", ["notificationId"], { unique: true })
@Entity("Notifications", { schema: "dbo" })
export class Notifications {
  @PrimaryGeneratedColumn({ type: "bigint", name: "NotificationId" })
  notificationId: string;

  @Column("timestamp without time zone", { name: "Date" })
  date: Date;

  @Column("text", { name: "Title" })
  title: string;

  @Column("text", { name: "Description" })
  description: string;

  @Column("boolean", { name: "IsReminder", default: () => "false" })
  isReminder: boolean;

  @Column("boolean", { name: "IsRead", default: () => "false" })
  isRead: boolean;

  @ManyToOne(() => Clients, (clients) => clients.notifications)
  @JoinColumn([{ name: "ClientId", referencedColumnName: "clientId" }])
  client: Clients;

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.notifications)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;
}
