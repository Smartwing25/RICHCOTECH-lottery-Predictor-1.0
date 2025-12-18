import { useContext } from 'react';
import { ToastContext } from './ToastContextInstance';

export const useToast = () => useContext(ToastContext);
