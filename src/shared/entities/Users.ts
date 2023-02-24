import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clients } from "./Clients";
import { GatewayConnectedUsers } from "./GatewayConnectedUsers";
import { Messages } from "./Messages";
import { Staff } from "./Staff";
import { UserProfilePic } from "./UserProfilePic";
import { EntityStatus } from "./EntityStatus";
import { Roles } from "./Roles";
import { UserType } from "./UserType";

@Index("pk_users_1557580587", ["userId"], { unique: true })
@Entity("Users", { schema: "dbo" })
export class Users {
  @PrimaryGeneratedColumn({ type: "bigint", name: "UserId" })
  userId: string;

  @Column("character varying", { name: "Username", length: 250 })
  username: string;

  @Column("character varying", { name: "Password", length: 250 })
  password: string;

  @Column("text", { name: "CurrentHashedRefreshToken", nullable: true })
  currentHashedRefreshToken: string | null;

  @Column("text", { name: "FirebaseToken", nullable: true })
  firebaseToken: string | null;

  @Column("boolean", { name: "IsAdminApproved", default: () => "false" })
  isAdminApproved: boolean;

  @Column("boolean", { name: "Enable", default: () => "true" })
  enable: boolean;

  @OneToMany(() => Clients, (clients) => clients.user)
  clients: Clients[];

  @OneToMany(
    () => GatewayConnectedUsers,
    (gatewayConnectedUsers) => gatewayConnectedUsers.user
  )
  gatewayConnectedUsers: GatewayConnectedUsers[];

  @OneToMany(() => Messages, (messages) => messages.fromUser)
  messages: Messages[];

  @OneToMany(() => Messages, (messages) => messages.toUser)
  messages2: Messages[];

  @OneToMany(() => Staff, (staff) => staff.user)
  staff: Staff[];

  @OneToOne(() => UserProfilePic, (userProfilePic) => userProfilePic.user)
  userProfilePic: UserProfilePic;

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.users)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;

  @ManyToOne(() => Roles, (roles) => roles.users)
  @JoinColumn([{ name: "RoleId", referencedColumnName: "roleId" }])
  role: Roles;

  @ManyToOne(() => UserType, (userType) => userType.users)
  @JoinColumn([{ name: "UserTypeId", referencedColumnName: "userTypeId" }])
  userType: UserType;
}
