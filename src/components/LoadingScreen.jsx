import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'SYNCING DATA...' }) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-pulse"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="loading-ring" />
      </motion.div>
      <motion.p
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
