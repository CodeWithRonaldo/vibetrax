import { FiLoader } from "react-icons/fi";
import styles from "./StateStyles.module.css";

export const LoadingState = ({ message = "Loading..." }) => (
  <div className={styles.stateContainer}>
    <FiLoader className={styles.spinner} size={48} />
    <p className={styles.stateMessage}>{message}</p>
  </div>
);
