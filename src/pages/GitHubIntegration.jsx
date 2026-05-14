import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useToast } from '../context/ToastContext';
import {
  RefreshCw,
  Loader2,
  GitFork,
  ExternalLink,
  User,
  CheckCircle2,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ContributionChart from '../components/ContributionChart';

const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i;

export default function GitHubIntegration() {
  const { activeTeamId } = useTeam();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [chartData, setChartData] = useState([]);
  const [detailedCommits, setDetailedCommits] = useState([]);

  const [repoConnected, setRepoConnected] = useState(false);

  const fetchContributionData = useCallback(async (projectId) => {
    if (!projectId) {
      setChartData([]);
      setDetailedCommits([]);
      setRepoConnected(false);
      return;
    }

    try {
      const res = await api.get(
        `/integrations/github/contributions/${projectId}`
      );

      if (res.data?.success) {
        setChartData(res.data.chartData || []);
        setDetailedCommits(res.data.detailed || []);

        const hasCommits =
          (res.data.chartData || []).length > 0 ||
          (res.data.detailed || []).length > 0;

        setRepoConnected(hasCommits);
      }
    } catch {
      setChartData([]);
      setDetailedCommits([]);
      setRepoConnected(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      if (!activeTeamId) {
        if (!mounted) return;

        setProjects([]);
        setSelectedProjectId('');
        return;
      }

      try {
        const res = await api.get(`/projects/team/${activeTeamId}`);
        const projectList = Array.isArray(res.data)
          ? res.data
          : [];

        if (!mounted) return;

        setProjects(projectList);

        const firstProjectId = projectList[0]?._id || '';
        setSelectedProjectId(firstProjectId);

        if (firstProjectId) {
          await fetchContributionData(firstProjectId);
        }
      } catch {
        if (!mounted) return;
        addToast('Failed to load projects', 'error');
      }
    };

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, [activeTeamId, addToast, fetchContributionData]);

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;

    setSelectedProjectId(projectId);
    setRepoLink('');
    setGithubUsername('');
    await fetchContributionData(projectId);
  };

  const handleConnect = useCallback(
    async (e) => {
      e.preventDefault();

      if (!selectedProjectId) {
        addToast('Select a project first', 'error');
        return;
      }

      if (!GITHUB_REPO_REGEX.test(repoLink.trim())) {
        addToast(
          'Enter valid repo URL: https://github.com/owner/repo',
          'error'
        );
        return;
      }

      setLoading(true);

      try {
        await api.post('/integrations/github/connect', {
          projectId: selectedProjectId,
          repoLink: repoLink.trim(),
          githubUsername: githubUsername.trim(),
        });

        setRepoConnected(true);

        addToast('Repository connected successfully', 'success');
      } catch (err) {
        addToast(
          err.response?.data?.message || 'GitHub connect failed',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      selectedProjectId,
      repoLink,
      githubUsername,
      addToast,
    ]
  );

  const handleSync = useCallback(async () => {
    if (!selectedProjectId) return;

    setSyncing(true);

    try {
      // fixed endpoint
      const res = await api.post(
        `/integrations/github/sync/${selectedProjectId}`
      );

      addToast(
        `Synced ${res.data?.saved || 0} commits`,
        'success'
      );

      await fetchContributionData(selectedProjectId);
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Sync failed',
        'error'
      );
    } finally {
      setSyncing(false);
    }
  }, [selectedProjectId, addToast, fetchContributionData]);

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>GITHUB INTEGRATION</h1>
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
      style={{
        maxHeight: '75vh',
        overflowY: 'auto',
      }}
    >
      <h1>GITHUB INTEGRATION</h1>
      <p className="subtitle">
        Connect repositories and track team contributions
      </p>

      {projects.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            style={{
              border: '1px solid rgba(47,185,212,0.2)',
              padding: '0.8rem',
              color: 'var(--teal)',
              borderRadius: '10px',
              width: '100%',
              background: 'rgba(0,0,0,0.35)',
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

      {!repoConnected && selectedProjectId && (
        <form
          onSubmit={handleConnect}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            marginBottom: '1.5rem',
          }}
        >
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(47,185,212,0.2)',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
            }}
          />

          <input
            type="text"
            placeholder="GitHub username (optional)"
            value={githubUsername}
            onChange={(e) =>
              setGithubUsername(e.target.value)
            }
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(47,185,212,0.2)',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'rgba(47,185,212,0.18)',
              border: '1px solid rgba(47,185,212,0.3)',
              color: 'var(--teal)',
              padding: '0.9rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {loading
              ? 'CONNECTING...'
              : 'CONNECT REPOSITORY'}
          </button>
        </form>
      )}

      {repoConnected && (
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            background: 'rgba(47,185,212,0.12)',
            color: 'var(--teal)',
            border: '1px solid rgba(47,185,212,0.2)',
            padding: '0.8rem 1rem',
            borderRadius: '10px',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          {syncing ? (
            <Loader2 size={14} className="spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          SYNC COMMITS
        </button>
      )}

      {chartData.length > 0 && (
        <ContributionChart
          data={chartData}
          label="commits"
        />
      )}

      <h3
        style={{
          color: 'var(--teal)',
          marginTop: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        COMMIT ACTIVITY
      </h3>

      {detailedCommits.length === 0 ? (
        <EmptyState
          title="No commits yet"
          description="Sync commits to view contribution activity."
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
          }}
        >
          {detailedCommits.map((commit) => (
            <div
              key={commit.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    {commit.authorName || 'Unknown'}
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#7ea2b1',
                    }}
                  >
                    @{commit.githubUsername || 'unknown'}
                  </div>
                </div>

                {commit.commitUrl && (
                  <a
                    href={commit.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--teal)',
                    }}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div
                style={{
                  marginTop: '0.7rem',
                  color: '#fff',
                }}
              >
                {commit.commitMessage}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.8rem',
                  marginTop: '0.7rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: 'var(--teal)' }}>
                  <GitFork size={12} />
                  {' '}
                  {commit.repoOwner}/{commit.repoName}
                </span>

                {commit.mappedUser ? (
                  <span style={{ color: '#7dffb3' }}>
                    <CheckCircle2 size={12} />
                    {' '}
                    {commit.mappedUser.name}
                  </span>
                ) : (
                  <span style={{ color: '#ffb366' }}>
                    <User size={12} />
                    {' '}
                    UNMAPPED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}