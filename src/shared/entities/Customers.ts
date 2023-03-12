import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Gender } from "./Gender";
import { Users } from "./Users";
import { Notifications } from "./Notifications";
import { Reservation } from "./Reservation";

@Index("pk_customers_741577680", ["customerId"], { unique: true })
@Entity("Customers", { schema: "dbo" })
export class Customers {
  @PrimaryGeneratedColumn({ type: "bigint", name: "CustomerId" })
  customerId: string;

  @Column("character varying", { name: "FirstName", length: 250 })
  firstName: string;

  @Column("character varying", {
    name: "MiddleName",
    nullable: true,
    length: 250,
  })
  middleName: string | null;

  @Column("character varying", { name: "LastName", length: 250 })
  lastName: string;

  @Column("character varying", { name: "Email", length: 250 })
  email: string;

  @Column("character varying", { name: "MobileNumber", length: 250 })
  mobileNumber: string;

  @Column("text", { name: "Address" })
  address: string;

  @Column("date", { name: "BirthDate" })
  birthDate: string;

  @Column("bigint", { name: "Age" })
  age: string;

  @Column("timestamp without time zone", {
    name: "LastCancelledDate",
    nullable: true,
  })
  lastCancelledDate: Date | null;

  @Column("bigint", { name: "NumberOfCancelledAttempt", default: () => "0" })
  numberOfCancelledAttempt: string;

  @ManyToOne(() => Gender, (gender) => gender.customers)
  @JoinColumn([{ name: "GenderId", referencedColumnName: "genderId" }])
  gender: Gender;

  @ManyToOne(() => Users, (users) => users.customers)
  @JoinColumn([{ name: "UserId", referencedColumnName: "userId" }])
  user: Users;

  @OneToMany(() => Notifications, (notifications) => notifications.customer)
  notifications: Notifications[];

  @OneToMany(() => Reservation, (reservation) => reservation.customer)
  reservations: Reservation[];
}
