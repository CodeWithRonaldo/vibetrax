import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./PlayerControls.module.css";
import { useCurrentAccount } from "@iota/dapp-kit";

const PlayerControls = ({ songData, onDurationLoaded, onPlayStatusChange }) => {
  const currentAccount = useCurrentAccount();
  const subscriberData = useOutletContext();
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => onPlayStatusChange(true);
    const handlePause = () => onPlayStatusChange(false);
    const handleLoadedMetadata = () => {
      onDurationLoaded(audio.duration);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onDurationLoaded, onPlayStatusChange]);

  return (
    <div className={styles.container}>
      <audio
        ref={audioRef}
        className={styles.audio}
        controls
        src={
          currentAccount?.address === songData.fields.artist ||
          currentAccount?.address === songData.fields.current_owner ||
          songData.fields.collaborators.includes(currentAccount?.address) ||
          (subscriberData && subscriberData.length > 0)
            ? songData.fields.high_quality_ipfs
            : songData.fields.low_quality_ipfs
        }
      />
    </div>
  );
};

export default PlayerControls;
