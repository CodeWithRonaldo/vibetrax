// CtaComponent.jsx;
import Button from "../button/Button";
import styles from "./CtaComponent.module.css";

const CtaComponent = ({
  isHome = true,
  title,
  subtitle,
  buttonText,
  handleClick,
  variant = "section", // "section" or "box"
  customBackground,
  customClassName,
  forSale,
  isPremium,
  handleSubscribeClick,
}) => {
  // Determine which class to use based on variant
  const containerClass = variant === "box" ? styles.ctaBox : styles.ctaSection;

  // Handle title class based on variant
  const titleClass = variant === "box" ? styles.boxTitle : styles.sectionTitle;

  // Handle description/subtitle class based on variant
  const descriptionClass =
    variant === "box" ? styles.boxDesc : styles.sectionSubtitle;

  // Apply custom background if provided
  const backgroundStyle = customBackground
    ? { background: customBackground }
    : {};

  return (
    <div
      className={`${containerClass} ${customClassName || ""}`}
      style={backgroundStyle}
    >
      <h2 className={titleClass}>{title}</h2>
      <p className={descriptionClass}>{subtitle}</p>
      {isHome ? (
        <button className={styles.button} onClick={handleClick}>
          {buttonText}
        </button>
      ) : isPremium ? (
        ""
      ) : forSale ? (
        <button className={styles.button} onClick={handleClick}>
          {buttonText}
        </button>
      ) : (
        <button className={styles.button} onClick={handleSubscribeClick}>
          {"Subscribe For Premium Quality"}
        </button>
      )}
    </div>
  );
};

export default CtaComponent;
