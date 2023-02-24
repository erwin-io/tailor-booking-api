import { Column, Entity, Index, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";

@Index("pk_reservationtype_738101670", ["reservationTypeId"], { unique: true })
@Entity("ReservationType", { schema: "dbo" })
export class ReservationType {
  @Column("bigint", { primary: true, name: "ReservationTypeId" })
  reservationTypeId: string;

  @Column("character varying", { name: "Name", length: 250 })
  name: string;

  @OneToMany(() => Reservation, (reservation) => reservation.reservationType)
  reservations: Reservation[];
}
