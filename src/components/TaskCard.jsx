import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Link as LinkIcon } from 'lucide-react';

export default function TaskCard({
  task,
  user,
  isCreator,
  onComplete,
  actionLoading
}) {
  const [showProof, setShowProof] = useState(false);
  const [proofInput, setProofInput] = useState('');

  const isDone = task.status === 'done';

  const isAssignedToMe =
    task.assignedTo?._id === user?._id ||
    task.assignedTo === user?._id;

  const canComplete =
    !isDone &&
    (isAssignedToMe || isCreator);

  const handleSubmitProof = () => {
    const finalProof = proofInput.trim() || 'manual';

    onComplete(task._id, finalProof);

    setShowProof(false);
    setProofInput('');
  };

  return (
    <div
      style={{
        background: isDone
          ? 'rgba(255,255,255,0.01)'
          : 'rgba(47, 185, 212, 0.02)',
        border: `1px solid ${
          isDone
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(47, 185, 212, 0.1)'
        }`,
        borderRadius: '10px',
        padding: '0.9rem 1rem',
        opacity: isDone ? 0.55 : 1,
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.8rem',
        }}
      >
        <div
          style={{
            color: isDone
              ? '#2fd48d'
              : 'rgba(47, 185, 212, 0.4)',
            marginTop: '2px',
          }}
        >
          {isDone ? (
            <CheckCircle2 size={16} />
          ) : (
            <Circle size={16} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: '0 0 0.4rem 0',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isDone
                ? 'rgba(255,255,255,0.5)'
                : '#fff',
              textDecoration: isDone
                ? 'line-through'
                : 'none',
            }}
          >
            {task.title}
          </h4>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              alignItems: 'center',
            }}
          >
            {task.deadline && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Clock size={10} />
                Due: {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}

            <span className={`task-type-badge ${task.type || 'other'}`}>
              {(task.type || 'other').replace('_', ' ')}
            </span>

            {task.assignedTo && (
              <span style={{ color: 'var(--teal)' }}>
                Assigned to:{' '}
                {task.assignedTo.name || task.assignedTo}
              </span>
            )}

            {task.weight && (
              <span
                style={{
                  background: 'rgba(255,107,107,0.1)',
                  color: '#ff6b6b',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                W: {task.weight}
              </span>
            )}
          </div>
        </div>
      </div>

      {canComplete && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {showProof ? (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <input
                type="text"
                placeholder="GitHub commit URL (optional)"
                value={proofInput}
                onChange={(e) => setProofInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitProof();
                  }
                }}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(47, 185, 212, 0.3)',
                  padding: '0.4rem 0.6rem',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />

              <button
                onClick={handleSubmitProof}
                disabled={actionLoading}
                style={{
                  background: 'var(--teal)',
                  color: '#000',
                  border: 'none',
                  padding: '0 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'SUBMITTING...' : 'CONFIRM'}
              </button>

              <button
                onClick={() => {
                  setShowProof(false);
                  setProofInput('');
                }}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '0 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowProof(true)}
              style={{
                background: 'transparent',
                color: 'var(--teal)',
                border: '1px solid rgba(47, 185, 212, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LinkIcon size={12} />
              COMPLETE TASK
            </button>
          )}
        </div>
      )}
    </div>
  );
}