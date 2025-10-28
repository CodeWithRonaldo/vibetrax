import React from "react";
import styles from "./AudioVisualizer.module.css";

const AudioVisualizer = ({ isPlaying }) => {
  const bars = Array(20).fill(null);

  return (
    <div className={styles.visualizer}>
      {bars.map((_, index) => (
        <div
          key={index}
          className={`${styles.visualizerBar} ${
            isPlaying ? styles.playing : styles.paused
          }`}
          style={{ "--index": index }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
