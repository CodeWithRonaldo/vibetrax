import { useState } from "react";
import styles from "./SectionContainer.module.css";

const SectionContainer = ({
  title,
  type = "default",
  items,
  backgroundColor,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleCardHover = (index) => {
    setActiveIndex(index);
  };

  const handleCardClick = (index) => {
    // For touch devices, toggle active state on click
    if (window.innerWidth <= 768) {
      setActiveIndex(activeIndex === index ? null : index);
    }
  };

  const renderItems = () => {
    switch (type) {
      case "features":
        return (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div
                key={index}
                className={`${styles.card} ${
                  activeIndex === index ? styles.active : ""
                }`}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => handleCardHover(null)}
                onClick={() => handleCardClick(index)}
              >
                <div className={styles.featureIcon}>
                  {typeof item.icon === "string"
                    ? item.icon
                    : item.icon && <item.icon size={55} color="#6366f1" />}
                </div>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        );

      case "steps":
        return (
          <div className={styles.steps}>
            {items.map((item, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{item.number}</div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.description}</p>
                {index !== items.length - 1 && (
                  <div className={styles.stepArrow}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "testimonials":
        return (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div
                key={index}
                className={`${styles.card} ${styles.testimonialCard} ${
                  activeIndex === index ? styles.active : ""
                }`}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => handleCardHover(null)}
                onClick={() => handleCardClick(index)}
              >
                <p className={styles.testimonialText}>{item.text}</p>
                <div className={styles.testimonialAuthor}>
                  <img
                    src={item.authorImage}
                    alt={item.authorName}
                    className={styles.authorImage}
                    loading="lazy"
                  />
                  <div>
                    <p className={styles.authorName}>{item.authorName}</p>
                    <p className={styles.authorTitle}>{item.authorTitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div
                key={index}
                className={`${styles.card} ${
                  activeIndex === index ? styles.active : ""
                }`}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => handleCardHover(null)}
                onClick={() => handleCardClick(index)}
              >
                {item.content}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <section
      className={styles.sectionContainer}
      style={{ backgroundColor: backgroundColor || "var(--color-bg-primary)" }}
    >
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {renderItems()}
      </div>
    </section>
  );
};

export default SectionContainer;
