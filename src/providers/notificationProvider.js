import { toast } from 'sonner';

export const notificationProvider = {
  open: ({ message, type, description, key }) => {
    if (type === 'success') {
      toast.success(message, { description });
    } else if (type === 'error') {
      toast.error(message, { description });
    } else if (type === 'info') {
      toast.info(message, { description });
    } else if (type === 'warning') {
      toast.warning(message, { description });
    } else {
      toast(message, { description });
    }
  },
  close: (key) => {
    toast.dismiss(key);
  },
};