import { User } from "./auth";

export interface IDevice {
    id: string;      // *"DEV-001"
    name: string;
    owner: string;
    status: 'Active' | 'In Maintenance' | 'Offline';
    type: string;
    specs?: {
        cpu: string;
        ram: string;
    };
    location: string;
    notes?: string;
    userId?: number;
    assignedTo?: User;
}