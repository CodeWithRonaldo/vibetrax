import { useState } from "react";
import styles from "./Footer.module.css";

const Footer = ({
  companyName = "VibeTrax",
  links = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: "Terms", url: "/terms" },
    { name: "Privacy", url: "/privacy" },
    { name: "Contact", url: "/contact" },
  ],
  socialLinks = [
    { name: "FB", url: "#" },
    { name: "TW", url: "#" },
    { name: "IG", url: "#" },
    { name: "DC", url: "#" },
  ],
  year = new Date().getFullYear(),
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <a href="/" className={styles.footerLogo}>
              {companyName}
            </a>
            <p className={styles.copyright}>
              &copy; {year} {companyName}. All rights reserved.
            </p>
          </div>

          <div className={styles.footerRight}>
            <nav className={styles.footerNav}>
              <ul className={styles.footerLinks}>
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                      className={hoverIndex === index ? styles.linkActive : ""}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={styles.socialLink}
                  aria-label={social.name}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
