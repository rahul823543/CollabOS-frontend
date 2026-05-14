import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FolderPlus, Bot } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';

export default function Projects() {
  const { activeTeamId, activeTeam } = useTeam();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [techStack, setTechStack] = useState('');

  const fetchProjects = async () => {
    if (!activeTeamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/projects/team/${activeTeamId}`);
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setShowCreate(false);
  }, [activeTeamId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title || !deadline || !activeTeamId) return;

    setLoading(true);
    try {
      if (useAI) {
        await api.post('/projects/create-with-ai', {
          title,
          description,
          deadline,
          teamId: activeTeamId,
          techStack: techStack.split(',').map(s => s.trim()).filter(Boolean)
        });
      } else {
        await api.post('/projects/create', {
          title,
          description,
          deadline,
          teamId: activeTeamId
        });
      }

      await fetchProjects();
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setDeadline('');
      setTechStack('');
      addToast('Project initialized successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      await fetchProjects();
      addToast('Project deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete project', 'error');
    }
  };

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>PROJECTS DIRECTORY</h1>
        <EmptyState title="No active team" description="Please select or create a team first." />
      </div>
    );
  }

  const isCreator = activeTeam?.createdBy?._id === user?._id || activeTeam?.createdBy === user?._id;

  return (
    <div className="glass-panel" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>{activeTeam?.name?.toUpperCase()} PROJECTS</h1>
          <p className="subtitle">Active missions and objectives</p>
        </div>

        {isCreator && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: 'rgba(47, 185, 212, 0.1)',
              color: 'var(--teal)',
              border: '1px solid rgba(47, 185, 212, 0.3)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(47, 185, 212, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(47, 185, 212, 0.1)'}
          >
            <FolderPlus size={14} /> NEW PROJECT
          </button>
        )}
      </div>

      {showCreate && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginBottom: '1rem' }}>
            INITIALIZE NEW PROJECT
          </h3>

          <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
            <textarea placeholder="Project Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{...inputStyle, resize: 'vertical'}} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>DEADLINE</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" id="useAI" checked={useAI} onChange={e => setUseAI(e.target.checked)} style={{ accentColor: 'var(--teal)' }} />
              <label htmlFor="useAI" style={{ fontSize: '0.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bot size={14} color="var(--teal)" /> Generate initial tasks with AI
              </label>
            </div>

            {useAI && (
              <input type="text" placeholder="Tech Stack (comma separated, e.g. React, Node, MongoDB)" value={techStack} onChange={e => setTechStack(e.target.value)} style={inputStyle} />
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, background: 'var(--teal)', color: '#000', padding: '0.6rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'PROCESSING...' : 'INITIALIZE'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} disabled={loading} style={{
                background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.6rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              }}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No active projects"
          description={isCreator ? 'Create one to get started.' : 'Awaiting mission orders.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              isCreator={isCreator}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(47, 185, 212, 0.12)',
  padding: '0.6rem 0.8rem',
  color: '#fff',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  outline: 'none',
  width: '100%',
};
