import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import ProfileModal from "./ProfileModal";
import "./Sidebar.css";
import absaLogo from "../assets/absa-logo.png";
import userProfileImg from "../assets/user-profile.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "•" },
  { to: "/tracks", label: "Strategy Tracks", icon: "•" },
  { to: "/simulation", label: "Simulation Lab", icon: "•" },
  { to: "/learn", label: "Learn", icon: "•" },
];

function NavIcon({ icon }) {
  return <span className="nav-icon">{icon}</span>;
}

export default function Sidebar() {
  const { profile } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <img src={absaLogo} alt="Absa logo" className="logo-img" />
        </div>
        <div className="logo-text">
          NextGen Studio
          <div className="logo-sub">First Five Years</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            <NavIcon icon={n.icon} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-user" onClick={() => setModalOpen(true)}>
        <div className="user-avatar">{profile.initials}</div>
        <span className="user-name">{profile.name}</span>
        <img src={userProfileImg} alt="" className="sidebar-user-settings" />
      </button>

      {modalOpen && <ProfileModal onClose={() => setModalOpen(false)} />}
    </aside>
  );
}
