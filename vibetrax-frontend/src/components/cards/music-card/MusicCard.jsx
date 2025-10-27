import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./MusicCard.module.css";

const MusicCard = ({ track, quality }) => {
  const [formattedDuration, setFormattedDuration] = useState("0:00");
  const isPremium = quality === "Premium";

  useEffect(() => {
    const audio = new Audio(
      isPremium ? track.high_quality_ipfs : track.low_quality_ipfs
    );

    const handleLoadedMetadata = () => {
      const totalSeconds = audio.duration;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setFormattedDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isPremium, track.high_quality_ipfs, track.low_quality_ipfs]);

  return (
    <Link to={`/discover/${track.id.id}`} className={styles.musicCard}>
      <img
        src={track.music_art}
        alt="Music Artwork"
        className={styles.musicImg}
      />
      <div
        className={`${styles.qualityBadge} ${
          isPremium ? styles.premiumBadge : ""
        }`}
      >
        {quality}
      </div>
      <div className={styles.musicDetails}>
        <h3 className={styles.musicTitle}>{track.title}</h3>
        <p className={styles.musicArtist}>{`${track.artist.slice(
          0,
          5
        )}...${track.artist.slice(-5)}`}</p>
        <div className={styles.musicMeta}>
          <span>{formattedDuration}</span>
          <span>{track.vote_count} votes</span>
        </div>
      </div>
    </Link>
  );
};

export default MusicCard;
