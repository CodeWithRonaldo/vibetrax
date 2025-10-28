import styles from "./SongDetails.module.css";
import PlayerControls from "../player-controls/PlayerControls";
import AudioVisualizer from "../audio-visualizer/AudioVisualizer";
import { Link } from "react-router-dom";
import { FiMusic, FiEye, FiHeart, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";

const SongDetails = ({ songData, isPremium, handleVote }) => {
  const [duration, setDuration] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  


  const handleDurationLoaded = (durationInSeconds) => {
    setDuration(durationInSeconds);
  };

  const handlePlayStatusChange = (playing) => {
    setIsPlaying(playing);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <section className={styles.container}>
      <div className={styles.albumArt}>
        <img
          src={songData.fields.music_art}
          alt="Album Cover"
          className={styles.albumImg}
        />
        <div className={styles.qualityBadge}>
          {isPremium ? "Premium" : "Standard"}
        </div>
        {isPlaying && (
          <div className={styles.playingIndicator}>
            <div className={styles.playingIcon}></div>
            <span>Now playing</span>
          </div>
        )}
      </div>

      <div className={styles.details}>
        <h1 className={styles.title}>{songData.fields.title}</h1>
        <div className={styles.artist}>
          By{" "}
          <Link
            to={`/profile/${songData.fields.artist}`}
            className={styles.artistLink}
          >
            {`${songData.fields.artist.slice(
              0,
              5
            )}...${songData.fields.artist.slice(-5)}`}
          </Link>
          <div className={styles.artistBadge}>
            <FiCheckCircle className={styles.verifiedIcon} />
            Verified Artist
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <FiMusic className={styles.metaIcon} />
            <span>{formatDuration(duration)}</span>
          </div>
          <div className={styles.metaItem}>
            <FiEye className={styles.metaIcon} />
            <span>{5} plays</span>
          </div>
          <div title={"Upvote Music"} className={`${styles.metaItem} ${styles.vote}`} onClick={handleVote}>
            <FiHeart className={styles.metaIcon} />
            <span>{songData.fields.vote_count} Votes</span>
          </div>
        </div>

        <p className={styles.description}>{songData.fields.description}</p>

        <div className={styles.tags}>
          <span className={styles.tag}>{songData.fields.genre}</span>
        </div>

        <div>
          <AudioVisualizer isPlaying={isPlaying} />
          <PlayerControls
            songData={songData}
            onDurationLoaded={handleDurationLoaded}
            onPlayStatusChange={handlePlayStatusChange}
          />
        </div>
      </div>
    </section>
  );
};

export default SongDetails;
