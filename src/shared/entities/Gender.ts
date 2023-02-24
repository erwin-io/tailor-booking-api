import { Column, Entity, Index, OneToMany } from "typeorm";
import { Clients } from "./Clients";
import { Staff } from "./Staff";

@Index("pk_gender_965578478", ["genderId"], { unique: true })
@Entity("Gender", { schema: "dbo" })
export class Gender {
  @Column("bigint", { primary: true, name: "GenderId" })
  genderId: string;

  @Column("character varying", { name: "Name", length: 100 })
  name: string;

  @OneToMany(() => Clients, (clients) => clients.gender)
  clients: Clients[];

  @OneToMany(() => Staff, (staff) => staff.gender)
  staff: Staff[];
}
