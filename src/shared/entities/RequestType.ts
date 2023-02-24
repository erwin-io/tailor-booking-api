import { Column, Entity, Index, OneToMany } from "typeorm";
import { Request } from "./Request";

@Index("pk_requesttype_1426104121", ["requestTypeId"], { unique: true })
@Entity("RequestType", { schema: "dbo" })
export class RequestType {
  @Column("bigint", { primary: true, name: "RequestTypeId" })
  requestTypeId: string;

  @Column("character varying", { name: "Name", length: 250 })
  name: string;

  @OneToMany(() => Request, (request) => request.requestType)
  requests: Request[];
}
