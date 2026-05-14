import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useToast } from '../context/ToastContext';
import { Globe, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function GoogleIntegration() {
  const { activeTeamId } = useTeam();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const callbackProjectId = searchParams.get('projectId');
  const googleStatus = searchParams.get('google');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    callbackProjectId || ''
  );
  const [connecting, setConnecting] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const fetchFiles = useCallback(
    async (projectId) => {
      if (!projectId) return;

      setFilesLoading(true);

      try {
        const res = await api.get(
          `/integrations/google/files?projectId=${projectId}`
        );

        setFiles(res.data?.files || []);
      } catch (err) {
        console.error('Failed to fetch files', err);
        setFiles([]);

        if (err.response?.status !== 404) {
          addToast(
            err.response?.data?.message || 'Failed to fetch Google files',
            'error'
          );
        }
      } finally {
        setFilesLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeTeamId) return;

      try {
        const res = await api.get(`/projects/team/${activeTeamId}`);
        const projectList = res.data || [];

        setProjects(projectList);

        if (!callbackProjectId && projectList.length > 0) {
          setSelectedProjectId(projectList[0]._id);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
        addToast('Failed to load projects', 'error');
      }
    };

    fetchProjects();
  }, [activeTeamId, callbackProjectId, addToast]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchFiles(selectedProjectId);
    }
  }, [selectedProjectId, fetchFiles]);

  useEffect(() => {
    if (googleStatus === 'success') {
      addToast('Google Drive connected successfully', 'success');
    }

    if (googleStatus === 'error') {
      addToast('Google Drive connection failed', 'error');
    }
  }, [googleStatus, addToast]);

  const handleConnect = async () => {
    if (!selectedProjectId) {
      addToast('Select a project first', 'error');
      return;
    }

    setConnecting(true);

    try {
      const res = await api.post('/integrations/google/connect', {
        projectId: selectedProjectId,
      });

      if (res.data?.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        addToast('Failed to get Google OAuth URL', 'error');
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to connect Google',
        'error'
      );
    } finally {
      setConnecting(false);
    }
  };

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>GOOGLE INTEGRATION</h1>
        <EmptyState
          title="No active team"
          description="Select or create a team first."
        />
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{ maxHeight: '75vh', overflowY: 'auto' }}
    >
      <h1>GOOGLE INTEGRATION</h1>
      <p className="subtitle">
        Connect Google Drive to access shared files
      </p>

      {projects.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
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
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <Globe
            size={20}
            strokeWidth={1.5}
            style={{ color: 'var(--teal)' }}
          />

          <div>
            <h3
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                marginBottom: '2px',
              }}
            >
              GOOGLE DRIVE
            </h3>

            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              Authorize access to shared project files
            </p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting || !selectedProjectId}
          style={{
            background: 'var(--teal)',
            color: '#000',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            opacity: connecting ? 0.6 : 1,
          }}
        >
          {connecting ? (
            <Loader2 size={12} className="spin" />
          ) : (
            <ExternalLink size={12} />
          )}

          CONNECT
        </button>
      </div>

      <h3
        style={{
          fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--teal)',
          marginBottom: '1rem',
        }}
      >
        FETCHED FILES
      </h3>

      {filesLoading ? (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
          }}
        >
          Loading files...
        </p>
      ) : files.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No files found"
          description="No accessible Google Drive files for this project."
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {files.map((file, i) => (
            <div
              key={file.id || i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '0.7rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <FileText
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: 'var(--teal-dim)' }}
                />

                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#fff',
                  }}
                >
                  {file.name || 'Untitled'}
                </span>
              </div>

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--teal)',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  OPEN ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}