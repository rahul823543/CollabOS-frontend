export default function TeamSelector({ teams, activeTeam, onSelect }) {
  if (teams.length > 1) {
    return (
      <select
        value={activeTeam?._id || ''}
        onChange={e => onSelect(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--teal)',
          border: '1px solid rgba(47,185,212,0.3)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {teams.map(t => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
    );
  }

  if (teams.length === 1) {
    return (
      <span
        style={{
          color: 'var(--teal)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.05em',
          padding: '4px 8px',
          border: '1px solid rgba(47,185,212,0.15)',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {activeTeam?.name}
      </span>
    );
  }

  return null;
}
