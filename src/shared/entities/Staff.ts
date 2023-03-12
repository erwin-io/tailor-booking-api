import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Reservation } from "./Reservation";
import { Gender } from "./Gender";
import { Users } from "./Users";

@Index("pk_staff_1493580359", ["staffId"], { unique: true })
@Entity("Staff", { schema: "dbo" })
export class Staff {
  @PrimaryGeneratedColumn({ type: "bigint", name: "StaffId" })
  staffId: string;

  @Column("character varying", { name: "Name", length: 250 })
  name: string;

  @Column("character varying", { name: "Email", length: 250 })
  email: string;

  @Column("character varying", { name: "MobileNumber", length: 250 })
  mobileNumber: string;

  @OneToMany(() => Reservation, (reservation) => reservation.staff)
  reservations: Reservation[];

  @ManyToOne(() => Gender, (gender) => gender.staff)
  @JoinColumn([{ name: "GenderId", referencedColumnName: "genderId" }])
  gender: Gender;

  @ManyToOne(() => Users, (users) => users.staff)
  @JoinColumn([{ name: "UserId", referencedColumnName: "userId" }])
  user: Users;
}
