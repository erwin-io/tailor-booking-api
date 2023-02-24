import { Column, Entity, Index, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";

@Index("PK_nvarchar(250)_770101784", ["reservationStatusId"], { unique: true })
@Entity("ReservationStatus", { schema: "dbo" })
export class ReservationStatus {
  @Column("bigint", { primary: true, name: "ReservationStatusId" })
  reservationStatusId: string;

  @Column("character varying", { name: "Name", length: 250 })
  name: string;

  @OneToMany(() => Reservation, (reservation) => reservation.reservationStatus)
  reservations: Reservation[];
}
