import { Column, Entity, Index, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";

@Index("pk_massintentiontype_1794105432", ["massIntentionTypeId"], {
  unique: true,
})
@Entity("MassIntentionType", { schema: "dbo" })
export class MassIntentionType {
  @Column("bigint", { primary: true, name: "MassIntentionTypeId" })
  massIntentionTypeId: string;

  @Column("character varying", { name: "Name", length: 50 })
  name: string;

  @OneToMany(() => Reservation, (reservation) => reservation.massIntentionType)
  reservations: Reservation[];
}
