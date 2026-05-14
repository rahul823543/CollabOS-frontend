export default function ContributionChart({ data = [], label = 'commits' }) {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value || d.commits || 0), 1);

  return (
    <div className="contribution-chart">
      {data.map((item, i) => {
        const value = item.value || item.commits || 0;
        const percentage = (value / maxValue) * 100;
        return (
          <div key={i} className="contribution-chart-row">
            <span className="contribution-chart-name">{item.user || item.name || 'Unknown'}</span>
            <div className="contribution-chart-bar-bg">
              <div
                className="contribution-chart-bar"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="contribution-chart-value">{value} {label}</span>
          </div>
        );
      })}
    </div>
  );
}
