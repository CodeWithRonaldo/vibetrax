import { FiMusic, FiPlus } from "react-icons/fi";
import styles from "./StateStyles.module.css";

export const EmptyState = ({
  message = "No music found",
  subMessage,
  actionText,
  onAction,
}) => (
  <div className={styles.stateContainer}>
    <FiMusic className={styles.emptyIcon} size={48} />
    <h3 className={styles.stateTitle}>{message}</h3>
    {subMessage && <p className={styles.stateSubMessage}>{subMessage}</p>}
    {onAction && (
      <button onClick={onAction} className={styles.actionButton}>
        <FiPlus /> {actionText}
      </button>
    )}
  </div>
);
