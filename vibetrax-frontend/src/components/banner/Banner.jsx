import { useNavigate } from "react-router-dom";
import Button from "../button/Button";
import styles from "./Banner.module.css";
import { useCurrentAccount } from "@iota/dapp-kit";

const Banner = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Empower Artists, Transform Music, Harness value.
        </h1>
        <p className={styles.heroSubtitle}>
          VibeTrax through blockchain, evision a music ecosystem where value
          flows freely between creators and listeners.
        </p>
        <div className={styles.heroCta}>
          <Button
            text={"Discover Music"}
            btnClass={"primary"}
            onClick={() => navigate("/discover")}
          />
          {currentAccount?.address && (
            <Button
              text={"For Artists"}
              btnClass={"secondary"}
              onClick={() => navigate(`/profile/${currentAccount.address}`)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Banner;
