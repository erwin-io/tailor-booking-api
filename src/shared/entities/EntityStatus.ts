import { Column, Entity, Index, OneToMany } from "typeorm";
import { Notifications } from "./Notifications";
import { Reminder } from "./Reminder";
import { Users } from "./Users";

@Index("pk_entitystatus_869578136", ["entityStatusId"], { unique: true })
@Entity("EntityStatus", { schema: "dbo" })
export class EntityStatus {
  @Column("bigint", { primary: true, name: "EntityStatusId" })
  entityStatusId: string;

  @Column("character varying", { name: "Name", length: 100 })
  name: string;

  @OneToMany(() => Notifications, (notifications) => notifications.entityStatus)
  notifications: Notifications[];

  @OneToMany(() => Reminder, (reminder) => reminder.entityStatus)
  reminders: Reminder[];

  @OneToMany(() => Users, (users) => users.entityStatus)
  users: Users[];
}
