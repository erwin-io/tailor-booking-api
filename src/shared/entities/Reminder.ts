import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EntityStatus } from "./EntityStatus";

@Index("pk_reminder_1365579903", ["reminderId"], { unique: true })
@Entity("Reminder", { schema: "dbo" })
export class Reminder {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ReminderId" })
  reminderId: string;

  @Column("character varying", { name: "Title", length: 250 })
  title: string;

  @Column("text", { name: "Description" })
  description: string;

  @Column("timestamp without time zone", { name: "DueDate" })
  dueDate: Date;

  @Column("numeric", {
    name: "Delivered",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  delivered: string;

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.reminders)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;
}
