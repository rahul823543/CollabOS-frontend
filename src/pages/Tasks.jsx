import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Circle, Clock, Loader2, Link as LinkIcon, Send } from 'lucide-react';

export default function Tasks() {
  const { activeTeamId, activeTeam } = useTeam();
  const { user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  const [newTaskInput, setNewTaskInput] = useState('');
  const [proofInput, setProofInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    if (!activeTeamId) return;
    try {
      const res = await api.get(`/projects/team/${activeTeamId}`);
      setProjects(res.data || []);
      if (res.data.length > 0 && !activeProjectId) {
        setActiveProjectId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const fetchTasks = async () => {
    if (!activeProjectId) {
      setTasks([]);
      return;
    }
    setTasksLoading(true);
    try {
      const res = await api.get(`/tasks?projectId=${activeProjectId}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTeamId]);

  useEffect(() => {
    fetchTasks();
  }, [activeProjectId]);

  const handleCreateTasks = async (e) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !activeProjectId) return;
    
    setActionLoading(true);
    const taskList = newTaskInput.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      await api.post('/tasks', {
        projectId: activeProjectId,
        tasks: taskList
      });
      setNewTaskInput('');
      await fetchTasks();
    } catch (err) {
      console.error("Failed to create tasks", err);
      alert(err.response?.data?.message || 'Failed to generate tasks');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!proofInput.trim()) {
      alert("Proof link or 'manual' is required to complete a task.");
      return;
    }
    
    setActionLoading(true);
    try {
      await api.put(`/tasks/${taskId}`, {
        status: 'done',
        proof: proofInput
      });
      setSelectedTaskId(null);
      setProofInput('');
      await fetchTasks();
    } catch (err) {
      console.error("Failed to complete task", err);
      alert(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setActionLoading(false);
    }
  };

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>TASKS DIRECTORY</h1>
        <p className="subtitle">No active team selected.</p>
      </div>
    );
  }

  const isCreator = activeTeam?.createdBy?._id === user?._id || activeTeam?.createdBy === user?._id;

  return (
    <div className="glass-panel" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
      <h1>PENDING TASKS</h1>
      <p className="subtitle">Missions awaiting completion</p>
      
      {projects.length > 0 ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <select 
            value={activeProjectId} 
            onChange={e => setActiveProjectId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(47, 185, 212, 0.2)',
              padding: '0.6rem 0.8rem',
              color: 'var(--teal)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled>Select Project...</option>
            {projects.map(p => (
              <option key={p._id} value={p._id} style={{ background: '#0a0b0e', color: '#fff' }}>
                {p.title} ({p.status})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
          No projects available in this team.
        </p>
      )}

      {isCreator && activeProjectId && (
        <form onSubmit={handleCreateTasks} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Generate tasks (comma separated e.g. 'Build UI, Setup DB')"
            value={newTaskInput}
            onChange={e => setNewTaskInput(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={actionLoading || !newTaskInput}
            style={{
              background: 'rgba(47, 185, 212, 0.1)',
              color: 'var(--teal)',
              border: '1px solid rgba(47, 185, 212, 0.3)',
              padding: '0 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {actionLoading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </form>
      )}

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
        {tasksLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            No tasks found for this project.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {tasks.map(task => {
              const isDone = task.status === 'done';
              const isAssignedToMe = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
              const canComplete = !isDone && (isAssignedToMe || isCreator);
              
              return (
                <div key={task._id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid rgba(255,255,255,${isDone ? '0.05' : '0.1'})`,
                  borderRadius: '6px',
                  padding: '0.8rem 1rem',
                  opacity: isDone ? 0.6 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                    <div style={{ color: isDone ? '#2fd48d' : 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: isDone ? 'rgba(255,255,255,0.6)' : '#fff', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={10} /> Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          Type: {task.type}
                        </span>
                        {task.assignedTo && (
                          <span style={{ color: 'var(--teal)' }}>
                            Assigned to: {task.assignedTo.name || task.assignedTo}
                          </span>
                        )}
                        <span style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '2px 6px', borderRadius: '4px' }}>
                          WA: {task.weightAssigned}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canComplete && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {selectedTaskId === task._id ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Enter GitHub Commit URL or 'manual'"
                            value={proofInput}
                            onChange={e => setProofInput(e.target.value)}
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
                            onClick={() => handleCompleteTask(task._id)}
                            disabled={actionLoading || !proofInput}
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
                            onClick={() => setSelectedTaskId(null)}
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
                          onClick={() => setSelectedTaskId(task._id)}
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
                            gap: '0.4rem'
                          }}
                        >
                          <LinkIcon size={12} /> COMPLETE TASK
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
