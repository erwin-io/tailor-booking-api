import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("pk_messages_997578592", ["messageId"], { unique: true })
@Entity("Messages", { schema: "dbo" })
export class Messages {
  @PrimaryGeneratedColumn({ type: "bigint", name: "MessageId" })
  messageId: string;

  @Column("text", { name: "Message" })
  message: string;

  @Column("timestamp without time zone", { name: "DateTime" })
  dateTime: Date;

  @Column("boolean", { name: "IsCustomer", default: () => "false" })
  isCustomer: boolean;

  @ManyToOne(() => Users, (users) => users.messages)
  @JoinColumn([{ name: "FromUserId", referencedColumnName: "userId" }])
  fromUser: Users;

  @ManyToOne(() => Users, (users) => users.messages2)
  @JoinColumn([{ name: "ToUserId", referencedColumnName: "userId" }])
  toUser: Users;
}
