import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import { ConnectButton, ConnectModal, useCurrentAccount } from "@iota/dapp-kit";
import vibetraxLogo from "../../assets/vibetraxlogo2.png";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const currentAccount = useCurrentAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src={vibetraxLogo} alt="VibeTrax logo" />
      </Link>

      {/* Mobile menu button */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to={"/"}
              className={({ isActive }) => (isActive ? styles.active : "")}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"discover"}
              className={({ isActive }) => (isActive ? styles.active : "")}
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </NavLink>
          </li>
          {currentAccount?.address && (
            <li>
              <NavLink
                to={`profile/${currentAccount?.address}`}
                className={({ isActive }) => (isActive ? styles.active : "")}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </NavLink>
            </li>
          )}
          <li className={styles.connectButton}>
            <ConnectButton className={styles.connectModal} />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
