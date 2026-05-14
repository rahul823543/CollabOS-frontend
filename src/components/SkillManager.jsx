import { useState, useCallback } from 'react';
import { Code, Plus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MAX_SKILLS = 15;
const SKILL_REGEX = /^[a-zA-Z0-9+#./&()\-\s]{2,50}$/;

const normalizeSkills = (skills = []) => {
  return [
    ...new Set(
      skills
        .map((s) => String(s).trim())
        .filter(Boolean)
        .filter((skill) => SKILL_REGEX.test(skill))
    ),
  ].slice(0, MAX_SKILLS);
};

export default function SkillManager({ compact = false }) {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [skillInput, setSkillInput] = useState('');
  const [skillSaving, setSkillSaving] = useState(false);

  const userSkills = normalizeSkills(user?.skills || []);

  const saveSkills = useCallback(
    async (newSkills) => {
      if (skillSaving) return;

      try {
        setSkillSaving(true);

        const cleanedSkills = normalizeSkills(newSkills);

        if (cleanedSkills.length === 0) {
          addToast('At least one valid skill is required', 'error');
          return;
        }

        const res = await api.put('/skills/users/skills', {
          skills: cleanedSkills,
        });

        const saved = Array.isArray(res.data?.skills)
          ? res.data.skills
          : cleanedSkills;

        updateUser({ skills: saved });
        addToast('Skills synced', 'success');
      } catch (err) {
        console.error(err);

        addToast(
          err.response?.data?.message || 'Failed to save skills',
          'error'
        );
      } finally {
        setSkillSaving(false);
      }
    },
    [skillSaving, updateUser, addToast]
  );

  const handleAddSkill = useCallback(() => {
    if (!skillInput.trim() || skillSaving) return;

    const parsedSkills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const invalidSkills = parsedSkills.filter(
      (skill) => !SKILL_REGEX.test(skill)
    );

    if (invalidSkills.length > 0) {
      addToast(
        `Invalid skills: ${invalidSkills.join(', ')}`,
        'error'
      );
      return;
    }

    const updated = normalizeSkills([
      ...userSkills,
      ...parsedSkills,
    ]);

    if (updated.length > MAX_SKILLS) {
      addToast(`Maximum ${MAX_SKILLS} skills allowed`, 'error');
      return;
    }

    setSkillInput('');
    saveSkills(updated);
  }, [
    skillInput,
    skillSaving,
    userSkills,
    saveSkills,
    addToast,
  ]);

  const handleRemoveSkill = useCallback(
    (skillToRemove) => {
      if (skillSaving) return;

      const updated = userSkills.filter(
        (skill) => skill !== skillToRemove
      );

      if (updated.length === 0) {
        addToast('At least one skill must remain', 'error');
        return;
      }

      saveSkills(updated);
    },
    [userSkills, saveSkills, skillSaving, addToast]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSkill();
      }
    },
    [handleAddSkill]
  );

  return (
    <div className={compact ? 'skill-editor' : 'dashboard-skills'}>
      <div
        className={
          compact
            ? 'skill-editor-label'
            : 'dashboard-skills-header'
        }
      >
        {compact ? (
          <>
            <Code size={10} strokeWidth={1.5} />
            TECH STACK
          </>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="dashboard-skills-title">
                <Code
                  size={13}
                  strokeWidth={1.5}
                  style={{
                    display: 'inline',
                    marginRight: '5px',
                    verticalAlign: 'middle',
                  }}
                />
                MY TECH STACK
              </span>
            </div>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-dim)',
              }}
            >
              {userSkills.length}/{MAX_SKILLS} skills
            </span>
          </>
        )}
      </div>

      <div
        className={compact ? 'skill-editor-tags' : 'skill-tags'}
        style={compact ? {} : { marginBottom: '10px' }}
      >
        {userSkills.length === 0 ? (
          <span className="skill-editor-empty">
            No skills set — add your tech skills below
          </span>
        ) : (
          userSkills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
              <button
                className="skill-tag-remove"
                onClick={() => handleRemoveSkill(skill)}
                disabled={skillSaving}
                title={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <div
        className={compact ? 'skill-editor-input-row' : ''}
        style={
          compact
            ? {}
            : {
                display: 'flex',
                gap: '4px',
              }
        }
      >
        <input
          className="skill-editor-input"
          type="text"
          placeholder="react, public speaking, video editing"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={skillSaving}
        />

        <button
          className="skill-editor-add-btn"
          onClick={handleAddSkill}
          disabled={skillSaving || !skillInput.trim()}
          title="Add skill"
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}