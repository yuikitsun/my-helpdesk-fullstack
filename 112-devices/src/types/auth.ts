import { IDevice } from "./device";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'rejected';
  devices?: IDevice[];
}

export interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}