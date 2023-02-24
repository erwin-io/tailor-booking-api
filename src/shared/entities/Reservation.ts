import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clients } from "./Clients";
import { MassCategory } from "./MassCategory";
import { MassIntentionType } from "./MassIntentionType";
import { ReservationStatus } from "./ReservationStatus";
import { ReservationType } from "./ReservationType";

@Index("pk_reservation_1890105774", ["reservationId"], { unique: true })
@Entity("Reservation", { schema: "dbo" })
export class Reservation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ReservationId" })
  reservationId: string;

  @Column("date", { name: "ReservationDate" })
  reservationDate: string;

  @Column("character varying", { name: "Time", length: 50 })
  time: string;

  @Column("text", { name: "Remarks", nullable: true })
  remarks: string | null;

  @Column("text", { name: "AdminRemarks", nullable: true })
  adminRemarks: string | null;

  @Column("boolean", { name: "IsCancelledByAdmin", default: () => "false" })
  isCancelledByAdmin: boolean;

  @ManyToOne(() => Clients, (clients) => clients.reservations)
  @JoinColumn([{ name: "ClientId", referencedColumnName: "clientId" }])
  client: Clients;

  @ManyToOne(() => MassCategory, (massCategory) => massCategory.reservations)
  @JoinColumn([
    { name: "MassCategoryId", referencedColumnName: "massCategoryId" },
  ])
  massCategory: MassCategory;

  @ManyToOne(
    () => MassIntentionType,
    (massIntentionType) => massIntentionType.reservations
  )
  @JoinColumn([
    {
      name: "MassIntentionTypeId",
      referencedColumnName: "massIntentionTypeId",
    },
  ])
  massIntentionType: MassIntentionType;

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

  @ManyToOne(
    () => ReservationType,
    (reservationType) => reservationType.reservations
  )
  @JoinColumn([
    { name: "ReservationTypeId", referencedColumnName: "reservationTypeId" },
  ])
  reservationType: ReservationType;
}
