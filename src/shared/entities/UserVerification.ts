import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("UserVerification_pkey", ["userVerificationId"], { unique: true })
@Entity("UserVerification", { schema: "dbo" })
export class UserVerification {
  @PrimaryGeneratedColumn({ type: "bigint", name: "UserVerificationId" })
  userVerificationId: string;

  @Column("character varying", { name: "otp" })
  otp: string;

  @Column("character varying", { name: "username" })
  username: string;

  @Column("character varying", { name: "mobileNumber" })
  mobileNumber: string;

  @Column("boolean", { name: "IsVerified", default: () => "false" })
  isVerified: boolean;
}
