import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PaymentType } from "./PaymentType";
import { Reservation } from "./Reservation";

@Index("Payment_pkey", ["paymentId"], { unique: true })
@Entity("Payment", { schema: "dbo" })
export class Payment {
  @PrimaryGeneratedColumn({ type: "bigint", name: "PaymentId" })
  paymentId: string;

  @Column("date", { name: "PaymentDate" })
  paymentDate: string;

  @Column("character varying", { name: "ReferenceNo", nullable: true })
  referenceNo: string | null;

  @Column("boolean", { name: "IsVoid", default: () => "false" })
  isVoid: boolean;

  @ManyToOne(() => PaymentType, (paymentType) => paymentType.payments)
  @JoinColumn([
    { name: "PaymentTypeId", referencedColumnName: "paymentTypeId" },
  ])
  paymentType: PaymentType;

  @ManyToOne(() => Reservation, (reservation) => reservation.payments)
  @JoinColumn([
    { name: "ReservationId", referencedColumnName: "reservationId" },
  ])
  reservation: Reservation;
}
