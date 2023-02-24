
import { Reservation } from "src/shared/entities/Reservation";
import { ReservationType } from "src/shared/entities/ReservationType";
import { ClientViewModel } from "./client.view-model";
import { ReservationStatusViewModel } from "./reservation-status.view-model";

export class ReservationViewModel {
  reservationId: string;
  reservationDate: string;
  time: string;
  remarks: string;
  isCancelledByAdmin: boolean;
  adminRemarks: string;
  client: ClientViewModel;
  reservationType: ReservationTypeViewModel;
  reservationStatus: ReservationStatusViewModel;
  constructor(model: Reservation | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.reservationId = model.reservationId;
    this.reservationDate = model.reservationDate;
    this.time = model.time;
    this.remarks = model.remarks;
    this.reservationType = model.reservationType;
    this.isCancelledByAdmin = model.isCancelledByAdmin;
    this.adminRemarks = model.adminRemarks;
    this.client = new ClientViewModel(model.client);
    this.reservationStatus = model.reservationStatus;
  }
}

export class ReservationTypeViewModel {
  reservationTypeId: string;
  name: string;
  constructor(model: ReservationType | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.reservationTypeId = model.reservationTypeId;
    this.name = model.name;
  }
}
