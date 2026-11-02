import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const { profile, updateProfile } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name);
  const [initials, setInitials] = useState(profile.initials);

  const previewInitials = initials.toUpperCase().slice(0, 2) || "?";

  const handleSave = () => {
    updateProfile("name", name.trim() || profile.name);
    updateProfile("initials", previewInitials);
    onClose();
  };

  const handleSignOut = () => {
    onClose();
    navigate("/");
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-box" onClick={(e) => e.stopPropagation()}>

        <div className="pm-header">
          <span className="pm-title">Profile &amp; Settings</span>
          <button className="pm-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* ── Profile ─────────────────────────────────────────── */}
        <div className="pm-section-label">PROFILE</div>
        <div className="pm-profile-row">
          <div className="pm-avatar">{previewInitials}</div>
          <div className="pm-fields">
            <div className="pm-field">
              <label className="pm-field-label" htmlFor="pm-name">Name</label>
              <input
                id="pm-name"
                className="search-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="pm-field">
              <label className="pm-field-label" htmlFor="pm-initials">Initials</label>
              <input
                id="pm-initials"
                className="search-input pm-initials-input"
                value={initials}
                maxLength={2}
                onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 2))}
              />
            </div>
          </div>
        </div>

        <div className="pm-divider" />

        {/* ── Account ──────────────────────────────────────────── */}
        <div className="pm-section-label">ACCOUNT</div>
        <div className="pm-account">
          <div className="pm-field">
            <label className="pm-field-label" htmlFor="pm-email">Email address</label>
            <div id="pm-email" className="pm-account-value">{profile.email}</div>
          </div>
          <div className="pm-field">
            <label className="pm-field-label" htmlFor="pm-password">Password</label>
            <div className="pm-account-row">
              <div id="pm-password" className="pm-account-value pm-account-password">••••••••••••</div>
              <button className="pm-change-link" disabled>Change</button>
            </div>
          </div>
        </div>

        <div className="pm-divider" />

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="pm-footer">
          <button className="btn btn-ghost pm-signout" onClick={handleSignOut}>Sign out</button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save changes
          </button>
        </div>

      </div>
    </div>
  );
}
