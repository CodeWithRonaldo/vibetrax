import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import vibetraxLogo from "../../assets/vibetraxlogo2.png";
import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaCompass,
  FaPlus,
  FaUser,
  FaMusic,
} from "react-icons/fa";

const Header = () => {
  const currentAccount = useCurrentAccount();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.hamburger}
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <Link to="/" className={styles.logo}>
            <img src={vibetraxLogo} alt="VibeTrax" />
          </Link>
        </div>

        <div className={styles.headerRight}>
          <ConnectButton />
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <nav className={styles.sidebarNav}>
          {/* Primary Navigation */}
          <div className={styles.navGroup}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              onClick={closeSidebar}
            >
              <FaHome className={styles.navIcon} />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/discover"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              onClick={closeSidebar}
            >
              <FaCompass className={styles.navIcon} />
              <span>Discover</span>
            </NavLink>
          </div>

          {/* Your Library */}
          {currentAccount?.address && (
            <div className={styles.navGroup}>
              <div className={styles.navGroupLabel}>Your Library</div>
              <NavLink
                to={`/profile/${currentAccount.address}`}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
                onClick={closeSidebar}
              >
                <FaUser className={styles.navIcon} />
                <span>Your Profile</span>
              </NavLink>
              <NavLink
                to="/discover"
                className={styles.navLink}
                onClick={closeSidebar}
              >
                <FaMusic className={styles.navIcon} />
                <span>Liked Songs</span>
              </NavLink>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
                onClick={closeSidebar}
              >
                <FaPlus className={styles.navIcon} />
                <span>Share Music</span>
              </NavLink>
            </div>
          )}
        </nav>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}
    </>
  );
};

export default Header;
