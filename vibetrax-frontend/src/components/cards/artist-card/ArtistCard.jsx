import Jazzicon from "react-jazzicon";
import styles from "./ArtistCard.module.css";

const ArtistCard = ({ name }) => {
  return (
    <div className={styles.artistCard}>
      <div className={styles.artistAvatar}>
        <Jazzicon diameter={40} seed={name} />
      </div>
      <h3 className={styles.artistName}>{`${name.slice(0, 5)}...${name.slice(
        -5
      )}`}</h3>
      {/* <span className={styles.artistFollowers}>{"45"} followers</span> */}
    </div>
  );
};

export default ArtistCard;
