import React from 'react';
import './TopPerformers.css';

function TopPerformers({ performers }) {
  // Deduplicate performers by name (keep highest score for each agent)
  const deduplicatedPerformers = Array.from(
    performers
      .reduce((map, performer) => {
        const existing = map.get(performer.name);
        if (!existing || performer.performanceScore > existing.performanceScore) {
          map.set(performer.name, performer);
        }
        return map;
      }, new Map())
      .values()
  ).sort((a, b) => b.performanceScore - a.performanceScore);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMedalEmoji = (index) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || '•';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#ff6b6b';
  };

  return (
    <div className="top-performers">
      <div className="performers-header">
        <h2>🏆 Top Performers Leaderboard</h2>
        <p>Top agents by performance score (Unique entries)</p>
      </div>

      {deduplicatedPerformers.length > 0 ? (
        <div className="performers-table">
          <div className="table-head">
            <div className="col col-rank">Rank</div>
            <div className="col col-name">Agent Name</div>
            <div className="col col-score">Score</div>
            <div className="col col-talk">Talk Time</div>
            <div className="col col-login">Logged In</div>
            <div className="col col-break">Break Time</div>
            <div className="col col-date">Date</div>
          </div>

          <div className="table-body">
            {deduplicatedPerformers.map((performer, index) => (
              <div
                key={`${performer.name}-${index}`}
                className={`table-row ${index === 0 ? 'top-rank' : index === 1 ? 'second-rank' : index === 2 ? 'third-rank' : ''}`}
              >
                <div className="col col-rank">
                  <span className="medal">{getMedalEmoji(index)}</span>
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="col col-name">
                  <span className="performer-name">{performer.name}</span>
                </div>
                <div className="col col-score">
                  <div className="score-badge" style={{ borderColor: getScoreColor(performer.performanceScore) }}>
                    <span style={{ color: getScoreColor(performer.performanceScore) }}>
                      {performer.performanceScore}%
                    </span>
                  </div>
                </div>
                <div className="col col-talk">
                  <span className="time-value">{formatTime(performer.talkTime)}</span>
                </div>
                <div className="col col-login">
                  <span className="time-value">{formatTime(performer.loggedInTime)}</span>
                </div>
                <div className="col col-break">
                  <span className="time-value">{formatTime(performer.breakTime)}</span>
                </div>
                <div className="col col-date">
                  <span className="date-value">{new Date(performer.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-performers">
          <p>📊 No performance data available yet.</p>
          <p>Upload a file to get started!</p>
        </div>
      )}

      {deduplicatedPerformers.length > 0 && (
        <div className="performers-summary">
          <div className="summary-card">
            <h4>📈 Statistics</h4>
            <p>Unique Agents: <strong>{deduplicatedPerformers.length}</strong></p>
            <p>Highest Score: <strong>{Math.max(...deduplicatedPerformers.map(p => p.performanceScore))}%</strong></p>
            <p>Average Score: <strong>{(deduplicatedPerformers.reduce((sum, p) => sum + p.performanceScore, 0) / deduplicatedPerformers.length).toFixed(2)}%</strong></p>
          </div>
          <div className="summary-card">
            <h4>⏱️ Time Metrics</h4>
            <p>Avg Talk Time: <strong>{formatTime(Math.round(deduplicatedPerformers.reduce((sum, p) => sum + p.talkTime, 0) / deduplicatedPerformers.length))}</strong></p>
            <p>Avg Logged In: <strong>{formatTime(Math.round(deduplicatedPerformers.reduce((sum, p) => sum + p.loggedInTime, 0) / deduplicatedPerformers.length))}</strong></p>
            <p>Avg Break Time: <strong>{formatTime(Math.round(deduplicatedPerformers.reduce((sum, p) => sum + p.breakTime, 0) / deduplicatedPerformers.length))}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopPerformers;
