import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Clients } from "./Clients";
import { RequestStatus } from "./RequestStatus";
import { RequestType } from "./RequestType";

@Index("pk_request_2034106287", ["requestId"], { unique: true })
@Entity("Request", { schema: "dbo" })
export class Request {
  @PrimaryGeneratedColumn({ type: "bigint", name: "RequestId" })
  requestId: string;

  @Column("date", { name: "RequestDate" })
  requestDate: string;

  @Column("text", { name: "RequestersFullName", nullable: true })
  requestersFullName: string | null;

  @Column("text", { name: "HusbandFullName", nullable: true })
  husbandFullName: string | null;

  @Column("text", { name: "WifeFullName", nullable: true })
  wifeFullName: string | null;

  @Column("date", { name: "ReferenceDate" })
  referenceDate: string;

  @Column("text", { name: "Remarks", nullable: true })
  remarks: string | null;

  @Column("text", { name: "AdminRemarks", nullable: true })
  adminRemarks: string | null;

  @Column("boolean", { name: "IsCancelledByAdmin", default: () => "false" })
  isCancelledByAdmin: boolean;

  @ManyToOne(() => Clients, (clients) => clients.requests)
  @JoinColumn([{ name: "ClientId", referencedColumnName: "clientId" }])
  client: Clients;

  @ManyToOne(() => RequestStatus, (requestStatus) => requestStatus.requests)
  @JoinColumn([
    { name: "RequestStatusId", referencedColumnName: "requestStatusId" },
  ])
  requestStatus: RequestStatus;

  @ManyToOne(() => RequestType, (requestType) => requestType.requests)
  @JoinColumn([
    { name: "RequestTypeId", referencedColumnName: "requestTypeId" },
  ])
  requestType: RequestType;
}
