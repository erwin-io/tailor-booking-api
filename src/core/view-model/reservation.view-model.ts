
import { Reservation } from "src/shared/entities/Reservation";
import { CustomerViewModel } from "./customer.view-model";
import { ReservationStatusViewModel } from "./reservation-status.view-model";
import { OrderItemType } from "src/shared/entities/OrderItemType";
import { OrderItem } from "src/shared/entities/OrderItem";
import { ReservationLevel } from "src/shared/entities/ReservationLevel";
import { StaffViewModel } from "./staff.view-model";

export class ReservationViewModel {
  reservationId: string;
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
  constructor(model: Reservation | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.reservationId = model.reservationId;
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
  constructor(model: OrderItem | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.orderItemId = model.orderItemId;
    this.remarks = model.remarks;
    this.orderItemType = model.orderItemType;
  }
}

export class OrderItemTypeViewModel {
  orderItemTypeId: string;
  name: string;
}
