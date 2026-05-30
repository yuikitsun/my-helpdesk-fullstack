import { toast } from "sonner";

export const alertService = {
    
    success: (message: string, description?: string) => {
        toast.success(message, {
            description: description,
            duration: 3000, 
        });
    },

    error: (message: string, description?: string) => {
        toast.error(message, {
            description: description,
            duration: 4000,
        });
    },
    
    info: (message: string) => {
        toast(message, {
            duration: 3000,
        });
    }
};