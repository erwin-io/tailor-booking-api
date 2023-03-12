import { Column, Entity, Index, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";

@Index("ReservationLevel_pkey", ["reservationLevelId"], { unique: true })
@Entity("ReservationLevel", { schema: "dbo" })
export class ReservationLevel {
  @Column("bigint", { primary: true, name: "ReservationLevelId" })
  reservationLevelId: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @OneToMany(() => Reservation, (reservation) => reservation.reservationLevel)
  reservations: Reservation[];
}
