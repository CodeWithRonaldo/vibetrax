import { useEffect, useState } from "react";
import {
  FiX,
  FiHeadphones,
  FiDollarSign,
  FiDownload,
  FiAward,
  FiLock,
} from "react-icons/fi";
import Button from "../../components/button/Button";
import styles from "./PremiumModal.module.css";

const PremiumModal = ({ isOpen, onClose, songData, onPurchase }) => {
  const [paymentStatus, setPaymentStatus] = useState("idle");

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBuy = async (e) => {
    e.preventDefault();
    setPaymentStatus("pending");
    const success = await onPurchase();
    setPaymentStatus(success ? "success" : "failed");
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.purchaseModal}>
        <button className={styles.modalClose} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Premium Upgrade</h2>
          <p className={styles.modalSubtitle}>
            Unlock high-quality audio and support the artist
          </p>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.trackPreview}>
            <img
              src={songData?.fields.music_art}
              alt="Album"
              className={styles.previewImg}
            />
            <div className={styles.previewDetails}>
              <h3 className={styles.previewTitle}>{songData?.fields.title}</h3>
              <p className={styles.previewArtist}>
                By{" "}
                {`${songData?.fields.artist.slice(
                  0,
                  5
                )}...${songData?.fields.artist.slice(-5)}`}
              </p>
              <div className={styles.metaItem}>
                <FiHeadphones className={styles.metaIcon} />
                <span>4:15</span>
              </div>
            </div>
          </div>

          <div className={styles.qualityComparison}>
            <h3 className={styles.qualityTitle}>Quality Comparison</h3>
            <table className={styles.qualityTable}>
              <thead>
                <tr>
                  <th>Quality</th>
                  <th>Bitrate</th>
                  <th>File Size</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.standardRow}>
                  <td>Standard</td>
                  <td>128 kbps</td>
                  <td>4.2 MB</td>
                </tr>
                <tr className={styles.premiumRow}>
                  <td>Premium</td>
                  <td>320 kbps</td>
                  <td>10.8 MB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <FiHeadphones className={styles.benefitIcon} />
              <div className={styles.benefitText}>
                <h4 className={styles.benefitTitle}>Superior Audio Quality</h4>
                <p className={styles.benefitDesc}>
                  Experience crystal clear sound with enhanced details and
                  depth.
                </p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <FiDollarSign className={styles.benefitIcon} />
              <div className={styles.benefitText}>
                <h4 className={styles.benefitTitle}>Direct Artist Support</h4>
                <p className={styles.benefitDesc}>
                  85% of your payment goes directly to the creators of this
                  track.
                </p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <FiDownload className={styles.benefitIcon} />
              <div className={styles.benefitText}>
                <h4 className={styles.benefitTitle}>Download Access</h4>
                <p className={styles.benefitDesc}>
                  Download the high-quality file for offline listening on any
                  device.
                </p>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <FiAward className={styles.benefitIcon} />
              <div className={styles.benefitText}>
                <h4 className={styles.benefitTitle}>Exclusive Content</h4>
                <p className={styles.benefitDesc}>
                  Access extended versions and behind-the-scenes content.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.priceContainer}>
            <span className={styles.priceLabel}>One-time purchase</span>
            <span className={styles.priceValue}>
              {songData?.fields.price} IOTA
            </span>
          </div>

          <Button
            text={
              paymentStatus === "pending"
                ? "Processing..."
                : paymentStatus === "success"
                ? "Purchase Successful"
                : "Complete Purchase"
            }
            onClick={handleBuy}
            disabled={paymentStatus === "pending"}
          />
          <p className={styles.secureNote}>
            <FiLock /> Secure blockchain transaction
          </p>
        </div>
      </div>
    </>
  );
};

export default PremiumModal;
