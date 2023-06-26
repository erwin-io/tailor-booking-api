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
import { Payment } from "./Payment";
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

  @Column("numeric", { name: "ServiceFee", default: () => "0" })
  serviceFee: string;

  @Column("numeric", { name: "OtherFee", default: () => "0" })
  otherFee: string;

  @Column("character varying", { name: "ReservationCode" })
  reservationCode: string;

  @Column("timestamp without time zone", {
    name: "SubmitItemsBeforeDateTime",
    nullable: true,
  })
  submitItemsBeforeDateTime: Date | null;

  @Column("timestamp without time zone", {
    name: "ToPickupDateTime",
    nullable: true,
  })
  toPickupDateTime: Date | null;

  @Column("character varying", { name: "ReasonToDecline", nullable: true })
  reasonToDecline: string | null;

  @OneToMany(() => Notifications, (notifications) => notifications.reservation)
  notifications: Notifications[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.reservation)
  orderItems: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.reservation)
  payments: Payment[];

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
