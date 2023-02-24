import { MassCategory } from "src/shared/entities/MassCategory";
import { MassIntentionType } from "src/shared/entities/MassIntentionType";
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
  massCategory: MassCategoryViewModel;
  massIntentionType: MassIntentionTypeViewModel;
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
    this.massCategory = model.massCategory;
    this.massIntentionType = model.massIntentionType;
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

export class MassCategoryViewModel {
  massCategoryId: string;
  name: string;
  constructor(model: MassCategoryViewModel | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.massCategoryId = model.massCategoryId;
    this.name = model.name;
  }
}

export class MassIntentionTypeViewModel {
  massIntentionTypeId: string;
  name: string;
  constructor(model: MassIntentionType | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.massIntentionTypeId = model.massIntentionTypeId;
    this.name = model.name;
  }
}