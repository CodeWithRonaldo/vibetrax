import styles from "./StateStyles.module.css";
import { ConnectButton } from "@iota/dapp-kit";
export const UnconnectedState = () => (
  <div className={styles.stateContainer}>
    <h3 className={styles.stateTitle}>Wallet not connected</h3>
    <p className={styles.stateSubMessage}>
      Please Connect your wallet to access this page
    </p>
    <ConnectButton />
  </div>
);
