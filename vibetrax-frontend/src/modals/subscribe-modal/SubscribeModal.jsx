import { useMusicActions } from "../../hooks/useMusicActions";
import React, { useState } from "react";
import styles from "./SubscribeModal.module.css";
import Button from "../../components/button/Button";
import {
  FiX,
  FiMusic,
  FiLock,
  FiHeadphones,
  FiStar,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

const SubscribeModal = ({ isOpen, onClose }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState("idle");
  const { subscribe } = useMusicActions();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h2>Unlock the Sounds</h2>
          <p className={styles.subtitle}>
            Subscribe to enjoy premium quality music and exclusive content.
          </p>

          <div className={styles.priceContainer}>
            <span className={styles.priceLabel}>Subscription Price:</span>
            <span className={styles.priceValue}>1 IOTA</span>
          </div>
        </div>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiMusic size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Early Access</h3>
              <p>Get new music before anyone else</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiLock size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Exclusive Content</h3>
              <p>Access special releases and behind-the-scenes</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiHeadphones size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>High-Quality Audio</h3>
              <p>Experience music in crystal clear sound</p>
            </div>
          </div>

          <div className={styles.benefitItem}>
            <div className={styles.benefitIcon}>
              <FiStar size={20} />
            </div>
            <div className={styles.benefitText}>
              <h3>Ad-Free Experience</h3>
              <p>No interruptions, just pure music enjoyment</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <p className={styles.ctaText}>
            Subscribe now and elevate your music experience!
          </p>
          <div className={styles.buttonGroup}>
            <Button
              text={
                subscriptionStatus === "subscribing"
                  ? "Processing..."
                  : subscriptionStatus === "subscribed"
                  ? "Subscribed"
                  : `Subscribe for 1 IOTA`
              }
              icon={
                subscriptionStatus === "subscribed" ? <FiCheck /> : undefined
              }
              disabled={subscriptionStatus === "subscribing"}
              onClick={() => subscribe(setSubscriptionStatus)}
              className={styles.primaryButton}
            />
            <Button
              text="Learn More"
              icon={<FiInfo />}
              className={styles.secondaryButton}
            />
          </div>

          {subscriptionStatus === "subscribed" && (
            <div className={styles.successAlert}>
              <FiCheck /> Subscription successful!
            </div>
          )}
          {subscriptionStatus === "failed" && (
            <div className={styles.failedAlert}>
              <FiAlertTriangle /> Subscription failed. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
