import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Notifications } from "./Notifications";
import { OrderItem } from "./OrderItem";
import { Customers } from "./Customers";
import { ReservationLevel } from "./ReservationLevel";
import { ReservationStatus } from "./ReservationStatus";
import { Staff } from "./Staff";

@Index("pk_reservation_1890105774", ["reservationId"], { unique: true })
@Entity("Reservation", { schema: "dbo" })
export class Reservation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ReservationId" })
  reservationId: string;

  @Column("date", { name: "ReqCompletionDate" })
  reqCompletionDate: string;

  @Column("date", { name: "EstCompletionDate", nullable: true })
  estCompletionDate: string | null;

  @Column("character varying", { name: "Description" })
  description: string;

  @Column("boolean", {
    name: "IsCancelledByAdmin",
    nullable: true,
    default: () => "false",
  })
  isCancelledByAdmin: boolean | null;

  @Column("character varying", { name: "AdminRemarks", nullable: true })
  adminRemarks: string | null;

  @OneToMany(() => Notifications, (notifications) => notifications.reservation)
  notifications: Notifications[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.reservation)
  orderItems: OrderItem[];

  @ManyToOne(() => Customers, (customers) => customers.reservations)
  @JoinColumn([{ name: "CustomerId", referencedColumnName: "customerId" }])
  customer: Customers;

  @ManyToOne(
    () => ReservationLevel,
    (reservationLevel) => reservationLevel.reservations
  )
  @JoinColumn([
    { name: "ReservationLevelId", referencedColumnName: "reservationLevelId" },
  ])
  reservationLevel: ReservationLevel;

  @ManyToOne(
    () => ReservationStatus,
    (reservationStatus) => reservationStatus.reservations
  )
  @JoinColumn([
    {
      name: "ReservationStatusId",
      referencedColumnName: "reservationStatusId",
    },
  ])
  reservationStatus: ReservationStatus;

  @ManyToOne(() => Staff, (staff) => staff.reservations)
  @JoinColumn([{ name: "StaffId", referencedColumnName: "staffId" }])
  staff: Staff;
}
