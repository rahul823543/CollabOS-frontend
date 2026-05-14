import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="toast-msg">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={12} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
