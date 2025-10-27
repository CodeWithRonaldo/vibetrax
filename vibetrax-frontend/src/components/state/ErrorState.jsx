import { FiAlertTriangle } from "react-icons/fi";
import styles from "./StateStyles.module.css";

export const ErrorState = ({
  error,
  message = "Something went wrong",
  actionText = "Try again",
  onRetry,
}) => (
  <div className={styles.stateContainer}>
    <FiAlertTriangle className={styles.errorIcon} size={48} />
    <h3 className={styles.stateTitle}>{message}</h3>
    {error?.message && <p className={styles.errorDetails}>{error.message}</p>}
    {onRetry && (
      <button onClick={onRetry} className={styles.retryButton}>
        {actionText}
      </button>
    )}
  </div>
);
