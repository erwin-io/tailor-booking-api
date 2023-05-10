import { Column, Entity, Index, OneToMany } from "typeorm";
import { Payment } from "./Payment";

@Index("PaymentType_pkey", ["paymentTypeId"], { unique: true })
@Entity("PaymentType", { schema: "dbo" })
export class PaymentType {
  @Column("bigint", { primary: true, name: "PaymentTypeId" })
  paymentTypeId: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @OneToMany(() => Payment, (payment) => payment.paymentType)
  payments: Payment[];
}
