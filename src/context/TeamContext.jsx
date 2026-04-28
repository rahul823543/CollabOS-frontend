import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    membersCount: 0,
    activeCount: 0,
    totalTasks: 0,
    progress: 0,
  });

  const fetchTeams = async () => {
    if (!user) {
      setTeams([]);
      setActiveTeamId(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.get('/team/my-teams');
      setTeams(res.data);
      
      // Auto-select first team if no active team is selected, or if active team is no longer in the list
      if (res.data.length > 0) {
        if (!activeTeamId || !res.data.find(t => t._id === activeTeamId)) {
          setActiveTeamId(res.data[0]._id);
        }
      } else {
        setActiveTeamId(null);
      }
    } catch (err) {
      console.error("Failed to load teams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activeTeamId) {
        setTeamStats({ membersCount: 0, activeCount: 0, totalTasks: 0, progress: 0 });
        return;
      }
      try {
        const res = await api.get(`/teams/activity/${activeTeamId}`);
        if (res.data) {
          const mCount = Array.isArray(res.data.members) ? res.data.members.length : 0;
          const aCount = Array.isArray(res.data.members) ? res.data.members.filter(m => m.isOnline).length : 0;
          setTeamStats({
            membersCount: mCount,
            activeCount: aCount,
            totalTasks: res.data.totalTasks || 0,
            progress: parseInt(res.data.overallProgress) || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load activity stats for context", err);
      }
    };
    
    fetchActivity();
    
    // Poll every 10 seconds to keep stats updated dynamically across all views
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, [activeTeamId]);

  const activeTeam = teams.find(t => t._id === activeTeamId) || null;

  return (
    <TeamContext.Provider value={{ 
      teams, 
      activeTeamId, 
      activeTeam, 
      setActiveTeamId, 
      loading,
      teamStats,
      refreshTeams: fetchTeams 
    }}>
      {children}
    </TeamContext.Provider>
  );
};
