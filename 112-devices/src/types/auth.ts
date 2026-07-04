import { IDevice } from "./device";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  devices?: IDevice[];
}