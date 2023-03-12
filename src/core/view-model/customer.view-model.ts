import { Customers } from "src/shared/entities/Customers";
import { GenderViewModel } from "./gender.view-model";
import { UserViewModel } from "./user.view-model";

export class CustomerViewModel {
  customerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  fullName: string;
  gender: GenderViewModel;
  user: UserViewModel;
  birthDate: string;
  age: string;
  constructor(model: Customers | undefined) {
    if (!model || model === null) {
      return null;
    }
    this.customerId = model.customerId;
    this.firstName = model.firstName;
    this.middleName = model.middleName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.mobileNumber = model.mobileNumber;
    this.address = model.address;
    this.fullName =
      this.firstName +
      (this.middleName ? " " + this.middleName + " " : " ") +
      this.lastName;
    this.gender = model.gender;
    this.user = new UserViewModel(model.user);
    this.birthDate = model.birthDate;
    this.age = model.age;
    this.age = model.age;
  }
}
