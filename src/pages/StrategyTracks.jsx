import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { TRACKS } from "../data/tracks";
import "./StrategyTracks.css";

export default function StrategyTracks() {
  const nav = useNavigate();
  const { profile, activateTrack } = useUser();
  const activeTrack = TRACKS.find((t) => t.id === profile.activeTrack);

  const milestoneStatuses = profile.milestoneProgress?.[profile.activeTrack] ?? {};
  const doneCount = activeTrack
    ? activeTrack.milestones.filter((_, i) => milestoneStatuses[i] === "done").length
    : 0;
  const activeIdx = activeTrack
    ? activeTrack.milestones.findIndex((_, i) => milestoneStatuses[i] === "active")
    : -1;
  const currentYear = activeIdx >= 0
    ? activeTrack.milestones[activeIdx].year
    : activeTrack?.milestones[0]?.year ?? 1;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Strategy Tracks</div>
      </div>

      <div className="page-body">
        {/* Active track banner */}
        {activeTrack && (
          <div className="card active-track-card">
            <div className="label" style={{ marginBottom: 8 }}>
              YOUR ACTIVE TRACK
            </div>
            <div className="active-track-row">
              <div>
                <div className="active-track-label">
                  {activeTrack.label} · YEAR {currentYear} OF {activeTrack.milestones.length}
                </div>
                <div className="active-track-name">{activeTrack.name}</div>
              </div>
              <div className="active-track-actions">
                <span className="badge badge-grey badge-active">ACTIVE</span>
                <button
                  className="btn btn-ghost"
                  onClick={() => nav(`/tracks/${activeTrack.id}`)}
                >
                  View my track →
                </button>
              </div>
            </div>
            <div className="active-track-progress">
              <div className="track-prog-bar">
                {activeTrack.milestones.map((_, i) => {
                  const s = milestoneStatuses[i] || "todo";
                  return (
                    <div
                      key={i}
                      className={`track-prog-seg track-prog-seg--${s === "done" ? "done" : s === "active" ? "active" : "todo"}`}
                    />
                  );
                })}
              </div>
              <span className="track-prog-text">
                {doneCount} of {activeTrack.milestones.length} milestones complete
              </span>
            </div>
          </div>
        )}

        <div className="label all-tracks-label">ALL TRACKS</div>

        <div className="grid-2">
          {TRACKS.map((track) => (
            <div
              key={track.id}
              className={`card track-card ${track.id === profile.activeTrack ? "track-card--active" : ""}`}
            >
              <div className="track-card-tag">
                {track.label}
                {track.id === profile.activeTrack ? " - ACTIVE" : ""}
              </div>
              <div className="track-card-name">{track.name}</div>
              <div className="track-card-tagline">{track.tagline}</div>

              <div className="divider" />

              <div className="track-card-meta">
                <div>
                  <div className="label track-meta-label">BEST FOR</div>
                  <div className="track-meta-value">{track.bestFor}</div>
                </div>
                <div>
                  <div className="label track-meta-label">
                    5-YR NET WORTH TARGET
                  </div>
                  <div className="track-meta-value--mono">
                    {track.netWorthTarget}
                  </div>
                </div>
              </div>

              <div className="track-sacrifices">
                <span className="track-sacrifices-lead">Sacrifices: </span>
                {track.sacrifices.map((s) => (
                  <span key={s} className="track-sacrifice-item">
                    · {s}
                  </span>
                ))}
              </div>

              {track.id === profile.activeTrack && (
                <div className="track-card-progress">
                  <div className="track-prog-bar">
                    {track.milestones.map((_, i) => {
                      const s = milestoneStatuses[i] || "todo";
                      return (
                        <div
                          key={i}
                          className={`track-prog-seg track-prog-seg--${s === "done" ? "done" : s === "active" ? "active" : "todo"}`}
                        />
                      );
                    })}
                  </div>
                  <span className="track-prog-text">
                    {doneCount} of {track.milestones.length} complete
                  </span>
                </div>
              )}

              <div className="track-card-footer">
                <button
                  className="btn btn-ghost track-view-btn"
                  onClick={() => nav(`/tracks/${track.id}`)}
                >
                  View track →
                </button>
                {track.id !== profile.activeTrack && (
                  <button
                    className="btn btn-outline track-activate-btn"
                    onClick={() => activateTrack(track.id)}
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
