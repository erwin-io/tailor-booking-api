import { Request } from "src/shared/entities/Request";
import { RequestType } from "src/shared/entities/RequestType";
import { ClientViewModel } from "./client.view-model";
import { RequestStatusViewModel } from "./request-status.view-model";

export class RequestViewModel {
  requestId: string;
  requestDate: string;
  remarks: string;
  isCancelledByAdmin: boolean;
  adminRemarks: string;
  client: ClientViewModel;
  requestType: RequestTypeViewModel;
  requestStatus: RequestStatusViewModel;
  requestersFullName: string;
  husbandFullName: string;
  wifeFullName: string;
  referenceDate: string;
  constructor(model: Request | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.requestId = model.requestId;
    this.requestDate = model.requestDate;
    this.remarks = model.remarks;
    this.requestType = model.requestType;
    this.isCancelledByAdmin = model.isCancelledByAdmin;
    this.adminRemarks = model.adminRemarks;
    this.client = new ClientViewModel(model.client);
    this.requestStatus = model.requestStatus;
    this.requestersFullName = model.requestersFullName;
    this.husbandFullName = model.husbandFullName;
    this.wifeFullName = model.wifeFullName;
    this.referenceDate = model.referenceDate;
  }
}

export class RequestTypeViewModel {
  requestTypeId: string;
  name: string;
  constructor(model: RequestType | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.requestTypeId = model.requestTypeId;
    this.name = model.name;
  }
}
