import { Column, Entity, Index, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";

@Index("pk_masscategory_1778105375", ["massCategoryId"], { unique: true })
@Entity("MassCategory", { schema: "dbo" })
export class MassCategory {
  @Column("bigint", { primary: true, name: "MassCategoryId" })
  massCategoryId: string;

  @Column("character varying", { name: "Name", length: 50 })
  name: string;

  @OneToMany(() => Reservation, (reservation) => reservation.massCategory)
  reservations: Reservation[];
}
