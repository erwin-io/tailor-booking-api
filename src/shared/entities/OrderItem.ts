import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EntityStatus } from "./EntityStatus";
import { OrderItemType } from "./OrderItemType";
import { Reservation } from "./Reservation";

@Index("pk_orderitem", ["orderItemId"], { unique: true })
@Entity("OrderItem", { schema: "dbo" })
export class OrderItem {
  @PrimaryGeneratedColumn({ type: "bigint", name: "OrderItemId" })
  orderItemId: string;

  @Column("character varying", { name: "Remarks" })
  remarks: string;

  @Column("bigint", { name: "Quantity", default: () => "1" })
  quantity: string;

  @ManyToOne(() => EntityStatus, (entityStatus) => entityStatus.orderItems)
  @JoinColumn([
    { name: "EntityStatusId", referencedColumnName: "entityStatusId" },
  ])
  entityStatus: EntityStatus;

  @ManyToOne(() => OrderItemType, (orderItemType) => orderItemType.orderItems)
  @JoinColumn([
    { name: "OrderItemTypeId", referencedColumnName: "orderItemTypeId" },
  ])
  orderItemType: OrderItemType;

  @ManyToOne(() => Reservation, (reservation) => reservation.orderItems)
  @JoinColumn([
    { name: "ReservationId", referencedColumnName: "reservationId" },
  ])
  reservation: Reservation;
}
