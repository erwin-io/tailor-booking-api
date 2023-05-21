import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActivityType } from "./ActivityType";
import { Users } from "./Users";

@Index("pk_activitylog", ["activityLogId"], { unique: true })
@Entity("ActivityLog", { schema: "dbo" })
export class ActivityLog {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ActivityLogId" })
  activityLogId: string;

  @Column("timestamp with time zone", { name: "Date" })
  date: Date;

  @Column("character varying", { name: "OS" })
  os: string;

  @Column("character varying", { name: "OSVersion", default: () => "0" })
  osVersion: string;

  @Column("character varying", { name: "Browser" })
  browser: string;

  @ManyToOne(() => ActivityType, (activityType) => activityType.activityLogs)
  @JoinColumn([
    { name: "ActivityTypeId", referencedColumnName: "activityTypeId" },
  ])
  activityType: ActivityType;

  @ManyToOne(() => Users, (users) => users.activityLogs)
  @JoinColumn([{ name: "UserId", referencedColumnName: "userId" }])
  user: Users;
}
