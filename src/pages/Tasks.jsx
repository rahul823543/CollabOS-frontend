import { useState, useEffect, useCallback, startTransition } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Send, Loader2 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';

export default function Tasks() {
  const { activeTeamId, activeTeam } = useTeam();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');

  const fetchProjects = useCallback(async () => {
    if (!activeTeamId) return;

    try {
      const res = await api.get(`/projects/team/${activeTeamId}`);
      const projectList = res.data || [];

      setProjects(projectList);

      if (projectList.length > 0 && !activeProjectId) {
        setActiveProjectId(projectList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
      addToast('Failed to load projects', 'error');
    }
  }, [activeTeamId, activeProjectId, addToast]);

  const fetchTasks = useCallback(async () => {
    if (!activeProjectId) {
      setTasks([]);
      return;
    }

    setTasksLoading(true);

    try {
      const res = await api.get(`/tasks?projectId=${activeProjectId}`);

      // only pending tasks
      const pendingTasks = (res.data || []).filter(
        (task) => task.status !== 'done'
      );

      setTasks(pendingTasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
      addToast('Failed to load tasks', 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [activeProjectId, addToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTasks = async (e) => {
    e.preventDefault();

    if (!newTaskInput.trim() || !activeProjectId) return;

    setActionLoading(true);

    const validTypes = [
      'frontend',
      'backend',
      'devops',
      'design',
      'other',
      'document_work',
    ];

    const taskList = newTaskInput
      .split(',')
      .map((s) => {
        const trimmed = s.trim();
        if (!trimmed) return null;

        const colonIdx = trimmed.lastIndexOf(':');

        if (colonIdx > 0) {
          const title = trimmed.slice(0, colonIdx).trim();
          const type = trimmed.slice(colonIdx + 1).trim().toLowerCase();

          return {
            title,
            type: validTypes.includes(type) ? type : 'other',
          };
        }

        return { title: trimmed, type: 'other' };
      })
      .filter(Boolean);

    if (!taskList.length) {
      setActionLoading(false);
      return;
    }

    try {
      await api.post('/tasks', {
        projectId: activeProjectId,
        tasks: taskList,
        overrides: [],
      });

      setNewTaskInput('');
      await fetchTasks();
      addToast(`${taskList.length} task(s) created`, 'success');
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || 'Failed to generate tasks',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, proof) => {
    setActionLoading(true);

    // instant UI update
    setTasks((prev) => prev.filter((task) => task._id !== taskId));

    try {
      await api.put(`/tasks/${taskId}`, {
        status: 'done',
        proof: proof?.trim() || 'manual',
      });

      addToast('Task completed!', 'success');
    } catch (err) {
      console.error('Failed to complete task', err);

      // restore tasks if failed
      await fetchTasks();

      addToast(
        err.response?.data?.message || 'Failed to complete task',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>TASKS DIRECTORY</h1>
        <EmptyState
          title="No active team"
          description="Select or create a team first."
        />
      </div>
    );
  }

  const isCreator =
    activeTeam?.createdBy?._id === user?._id ||
    activeTeam?.createdBy === user?._id;

  return (
    <div
      className="glass-panel"
      style={{ maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}
    >
      <h1>PENDING TASKS</h1>
      <p className="subtitle">Missions awaiting completion</p>

      {projects.length > 0 ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            style={{
              border: '1px solid rgba(47, 185, 212, 0.2)',
              padding: '0.6rem 0.8rem',
              color: 'var(--teal)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>
              Select Project...
            </option>

            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.status || 'active'})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <EmptyState
          title="No projects"
          description="Create a project first to manage tasks."
        />
      )}

      {isCreator && activeProjectId && (
        <form
          onSubmit={handleCreateTasks}
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <input
            type="text"
            placeholder="Tasks (Build UI:frontend, Setup DB:backend)"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />

          <button type="submit" disabled={actionLoading || !newTaskInput}>
            {actionLoading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      )}

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {tasksLoading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="No pending tasks for this project."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                user={user}
                isCreator={isCreator}
                onComplete={handleCompleteTask}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}