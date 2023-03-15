import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Customers } from "./Customers";
import { EntityStatus } from "./EntityStatus";
import { Reservation } from "./Reservation";

@Index("pk_notifications_1061578820", ["notificationId"], { unique: true })
@Entity("Notifications", { schema: "dbo" })
export class Notifications {
  @PrimaryGeneratedColumn({ type: "bigint", name: "NotificationId" })
  notificationId: string;

  @Column("timestamp with time zone", { name: "Date" })
  date: Date;

  @Column("character varying", { name: "Title" })
  title: string;

  @Column("character varying", { name: "Description" })
  description: string;

  @Column("boolean", { name: "IsRead", nullable: true, default: () => "false" })
  isRead: boolean | null;

  @ManyToOne(() => Customers, (customers) => customers.notifications)
  @JoinColumn([{ name: "CustomerId", referencedColumnName: "customerId" }])
  customer: Customers;

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.notifications)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;

  @ManyToOne(() => Reservation, (reservation) => reservation.notifications)
  @JoinColumn([
    { name: "ReservationId", referencedColumnName: "reservationId" },
  ])
  reservation: Reservation;
}
