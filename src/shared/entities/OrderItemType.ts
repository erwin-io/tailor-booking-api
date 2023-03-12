import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderItem } from "./OrderItem";
import { EntityStatus } from "./EntityStatus";

@Index("OrderItemType_pkey", ["orderItemTypeId"], { unique: true })
@Entity("OrderItemType", { schema: "dbo" })
export class OrderItemType {
  @PrimaryGeneratedColumn({ type: "bigint", name: "OrderItemTypeId" })
  orderItemTypeId: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderItemType)
  orderItems: OrderItem[];

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.orderItemTypes)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;
}
