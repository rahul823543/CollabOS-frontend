import { Calendar, Clock, Pencil, Trash2 } from 'lucide-react';

export default function ProjectCard({ project, isCreator, onEdit, onDelete }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem' }}>{project.title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            background: project.status === 'done' ? 'rgba(47, 212, 141, 0.1)' : 'rgba(47, 185, 212, 0.1)',
            color: project.status === 'done' ? '#2fd48d' : 'var(--teal)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            border: `1px solid ${project.status === 'done' ? 'rgba(47, 212, 141, 0.3)' : 'rgba(47, 185, 212, 0.3)'}`
          }}>
            {(project.status || 'active').toUpperCase()}
          </span>
          {isCreator && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(project)}
                  title="Edit project"
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <Pencil size={13} strokeWidth={1.5} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(project._id)}
                  title="Delete project"
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 107, 107, 0.6)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.4 }}>
        {project.description || 'No description provided.'}
      </p>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} /> {new Date(project.createdAt).toLocaleDateString()}
        </span>
        {project.deadline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: new Date(project.deadline) < new Date() && project.status !== 'done' ? '#ff6b6b' : 'inherit' }}>
            <Clock size={12} /> Due: {new Date(project.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
