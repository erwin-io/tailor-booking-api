import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("pk_8c82d7f526340ab734260ea46be_1029578706", ["id"], { unique: true })
@Entity("Migrations", { schema: "dbo" })
export class Migrations {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("bigint", { name: "Timestamp" })
  timestamp: string;

  @Column("character varying", { name: "Name", length: 255 })
  name: string;
}
