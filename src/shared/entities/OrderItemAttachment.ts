import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Files } from "./Files";
import { OrderItem } from "./OrderItem";

@Index("pk_OrderItemAttachmentId", ["orderItemAttachmentId"], { unique: true })
@Entity("OrderItemAttachment", { schema: "dbo" })
export class OrderItemAttachment {
  @PrimaryGeneratedColumn({ type: "bigint", name: "OrderItemAttachmentId" })
  orderItemAttachmentId: string;

  @ManyToOne(() => Files, (files) => files.orderItemAttachments)
  @JoinColumn([{ name: "FileId", referencedColumnName: "fileId" }])
  file: Files;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.orderItemAttachments)
  @JoinColumn([{ name: "OrderItemId", referencedColumnName: "orderItemId" }])
  orderItem: OrderItem;
}
