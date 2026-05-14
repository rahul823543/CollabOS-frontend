import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-state">
      <AlertTriangle size={28} strokeWidth={1.5} />
      <p className="error-state-msg">{message}</p>
      {onRetry && (
        <button className="error-state-btn" onClick={onRetry}>
          RETRY
        </button>
      )}
    </div>
  );
}
