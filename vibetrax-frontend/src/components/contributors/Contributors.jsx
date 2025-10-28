import { useCurrentAccount } from "@iota/dapp-kit";
import styles from "./Contributors.module.css";
import Jazzicon from "react-jazzicon";

import { Link } from "react-router-dom";

const Contributors = ({
  contributors,
  splits,
  roles,
  price,
  royalty_percentage,
}) => {
  const currentAccount = useCurrentAccount();
  return (
    <section className={styles.contributors}>
      <h2 className={styles.sectionTitle}>Contributors</h2>
      <div className={styles.contributorsList}>
        {contributors?.map((contributor, index) => (
          <div key={index} className={styles.contributorCard}>
            <Jazzicon diameter={50} seed={contributor} />
            <div className={styles.contributorInfo}>
              <p>{roles[index]}</p>
              <Link
                to={`/profile/${contributor}`}
                className={styles.contributorName}
              >{`${contributor.slice(0, 5)}...${contributor.slice(-5)}`}</Link>
              {/* <p className={styles.contributorRole}>{contributor.role}</p> */}
              {contributors.includes(currentAccount?.address) ? (
                <p className={styles.contributorShare}>
                  {splits[index] / 100}% Shares of Royalty <br /> (
                  {((price * (royalty_percentage / 100)) / 100) *
                    (splits[index] / 100 / 100)}{" "}
                  IOTA)
                </p>
              ) : (
                " "
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Contributors;
