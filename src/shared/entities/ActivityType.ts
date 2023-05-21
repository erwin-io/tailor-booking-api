import { Column, Entity, Index, OneToMany } from "typeorm";
import { ActivityLog } from "./ActivityLog";

@Index("ActivityType_pkey", ["activityTypeId"], { unique: true })
@Entity("ActivityType", { schema: "dbo" })
export class ActivityType {
  @Column("bigint", { primary: true, name: "ActivityTypeId" })
  activityTypeId: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.activityType)
  activityLogs: ActivityLog[];
}
