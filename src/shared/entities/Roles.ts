import { Column, Entity, Index, OneToMany } from "typeorm";
import { Users } from "./Users";

@Index("u_roles_1413580074", ["name"], { unique: true })
@Index("pk_role_1397580017", ["roleId"], { unique: true })
@Entity("Roles", { schema: "dbo" })
export class Roles {
  @Column("bigint", { primary: true, name: "RoleId" })
  roleId: string;

  @Column("character varying", { name: "Name", unique: true, length: 100 })
  name: string;

  @Column("text", { name: "Access", nullable: true })
  access: string | null;

  @OneToMany(() => Users, (users) => users.role)
  users: Users[];
}
