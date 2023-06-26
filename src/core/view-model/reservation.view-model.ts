
import { Reservation } from "src/shared/entities/Reservation";
import { CustomerViewModel } from "./customer.view-model";
import { ReservationStatusViewModel } from "./reservation-status.view-model";
import { OrderItemType } from "src/shared/entities/OrderItemType";
import { OrderItem } from "src/shared/entities/OrderItem";
import { ReservationLevel } from "src/shared/entities/ReservationLevel";
import { StaffViewModel } from "./staff.view-model";
import { FilesViewModel } from "./file.view.mode";
import { OrderItemAttachment } from "src/shared/entities/OrderItemAttachment";

export class ReservationViewModel {
  reservationId: string;
  reservationCode: string;
  reqCompletionDate: string;
  estCompletionDate: string;
  description: string;
  isCancelledByAdmin: boolean;
  adminRemarks: string;
  reservationLevel: ReservationLevelViewModel;
  customer: CustomerViewModel;
  orderItems: OrderItemViewModel[];
  reservationStatus: ReservationStatusViewModel;
  staff: StaffViewModel;
  payments: PaymentViewModel[];
  serviceFee: number = 0;
  otherFee: number = 0;
  submitItemsBeforeDateTime: Date;
  toPickupDateTime: Date;
  reasonToDecline: string;
  constructor(model: Reservation | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.reservationId = model.reservationId;
    this.reservationCode = model.reservationCode;
    this.reqCompletionDate = model.reqCompletionDate;
    this.estCompletionDate = model.estCompletionDate;
    this.description = model.description;
    this.isCancelledByAdmin = model.isCancelledByAdmin;
    this.adminRemarks = model.adminRemarks;
    this.reservationLevel = model.reservationLevel;
    this.customer = new CustomerViewModel(model.customer);
    this.reservationStatus = model.reservationStatus;
    this.orderItems = model.orderItems;
    this.staff = new StaffViewModel(model.staff);
    this.payments = model.payments;
    this.serviceFee = Number(model.serviceFee);
    this.otherFee = Number(model.otherFee);
    this.submitItemsBeforeDateTime = model.submitItemsBeforeDateTime;
    this.toPickupDateTime = model.toPickupDateTime;
    this.reasonToDecline = model.reasonToDecline;
  }
}

export class ReservationLevelViewModel {
  reservationLevelId: string;
  name: string;
}

export class OrderItemViewModel {
  orderItemId: string;
  remarks: string;
  quantity: string;
  orderItemType: OrderItemTypeViewModel;
  orderItemAttachments: OrderItemAttachmentViewModel[];
  constructor(model: OrderItem | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.orderItemId = model.orderItemId;
    this.remarks = model.remarks;
    this.orderItemType = model.orderItemType;
    this.orderItemAttachments = model.orderItemAttachments;
  }
}

export class OrderItemTypeViewModel {
  orderItemTypeId: string;
  name: string;
}

export class OrderItemAttachmentViewModel {
  orderItemAttachmentId: string;
  file: FilesViewModel;
  constructor(model: OrderItemAttachment | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.orderItemAttachmentId = model.orderItemAttachmentId;
    this.file = new FilesViewModel(model.file);
  }
}

export class PaymentViewModel {
  paymentId: string;
  paymentDate: string;
  referenceNo: string;
  isVoid: boolean;
  paymentType: PaymentTypeViewModel;
}

export class PaymentTypeViewModel {
  paymentTypeId: string;
  name: string;
}