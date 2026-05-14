import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setActiveTeamId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/team/my-teams');

      // Safely extract array from response regardless of shape
      const teamsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.teams)
        ? res.data.teams
        : [];

      setTeams(teamsArray);

      // Auto-select first team if no active team is selected,
      // or if active team is no longer in the list
      if (teamsArray.length > 0) {
        setActiveTeamId(prev => {
          if (!prev || !teamsArray.find(t => t._id === prev)) {
            return teamsArray[0]._id;
          }
          return prev;
        });
      } else {
        setActiveTeamId(null);
      }
    } catch (err) {
      console.error('Failed to load teams', err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Guard against teams ever being a non-array before calling .find()
  const activeTeam = Array.isArray(teams)
    ? teams.find(t => t._id === activeTeamId) || null
    : null;

  return (
    <TeamContext.Provider
      value={{
        teams,
        activeTeamId,
        activeTeam,
        setActiveTeamId,
        loading,
        refreshTeams: fetchTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};