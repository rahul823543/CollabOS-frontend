import { CheckCircle2, XCircle } from 'lucide-react';

export default function IntegrationCard({ title, description, connected, onConnect, onAction, actionLabel, icon: Icon }) {
  return (
    <div className="integration-card">
      <div className="integration-card-header">
        {Icon && <Icon size={20} strokeWidth={1.5} className="integration-card-icon" />}
        <div>
          <h3 className="integration-card-title">{title}</h3>
          <p className="integration-card-desc">{description}</p>
        </div>
      </div>
      <div className="integration-card-status">
        {connected ? (
          <span className="integration-connected">
            <CheckCircle2 size={12} /> CONNECTED
          </span>
        ) : (
          <span className="integration-disconnected">
            <XCircle size={12} /> NOT CONNECTED
          </span>
        )}
      </div>
      <div className="integration-card-actions">
        {!connected && onConnect && (
          <button className="integration-btn-primary" onClick={onConnect}>
            CONNECT
          </button>
        )}
        {connected && onAction && actionLabel && (
          <button className="integration-btn-secondary" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
