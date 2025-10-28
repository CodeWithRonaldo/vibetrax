import React, { useState } from "react";
import Button from "../button/Button";
import styles from "./SubscribeBanner.module.css";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";

const SubscribeBanner = ({ subscriberData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleCloseButtonClick = () => {
    setIsVisible(false);
    // localStorage.setItem("subscribeBannerClosed", "true");
  };

  const handleOpen = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  // If user is subscribed, don't show banner
  if (subscriberData > 0) {
    return null;
  }

  // Only check visibility if we've already determined user is not subscribed
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={styles.infoBanner}>
        <div className={styles.content}>
          <p>Subscribe to enjoy premium quality music and exclusive content.</p>
          <Button
            text="Subscribe"
            onClick={handleOpen}
            className={styles.subscribeButton}
          />
        </div>
        <button onClick={handleCloseButtonClick} className={styles.closeButton}>
          ×
        </button>
      </div>
      <SubscribeModal
        isOpen={isOpen}
        onClose={handleClose}
        subscriberData={subscriberData}
      />
    </>
  );
};

export default SubscribeBanner;
