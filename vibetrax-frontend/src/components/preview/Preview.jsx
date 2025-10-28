import { useState } from "react";
import Button from "../button/Button";
import styles from "./Preview.module.css";
import { useCurrentAccount } from "@iota/dapp-kit";

const Preview = ({
  previewTitle,
  highQuality,
  lowQuality,
  PreviewImage,
  PreviewGenre,
}) => {
  const [activeTab, setActiveTab] = useState("standard");
  const currentAccount = useCurrentAccount();

  return (
    <>
      {/* Preview Section */}
      <div className={styles["preview-section"]}>
        <div className={styles["preview-header"]}>
          <h3 className={styles["preview-title"]}>Track Preview</h3>
          <div className={styles["preview-tabs"]}>
            <Button
              text={"Standard"}
              btnClass="primary"
              onClick={() => setActiveTab("standard")}
            />
            <Button
              text={"Premium"}
              btnClass="secondary"
              onClick={() => setActiveTab("premium")}
            />
          </div>
        </div>
        <div className={styles["preview-content"]}>
          <div className={styles["preview-artwork"]}>
            <img
              src={PreviewImage ? URL.createObjectURL(PreviewImage) : ""}
              alt="artwork"
            />
          </div>
          <div className={styles["preview-info"]}>
            <div className={styles["preview-metadata"]}>
              <div className={styles["preview-metadata-item"]}>
                <div className={styles["preview-metadata-label"]}>Title</div>
                <div className={styles["preview-metadata-value"]}>
                  {previewTitle}
                </div>
              </div>
              <div className={styles["preview-metadata-item"]}>
                <div className={styles["preview-metadata-label"]}>Artist</div>
                <div
                  className={styles["preview-metadata-value"]}
                >{`${currentAccount?.address.slice(
                  0,
                  5
                )}...${currentAccount?.address.slice(-5)}`}</div>
              </div>
              <div className={styles["preview-metadata-item"]}>
                <div className={styles["preview-metadata-label"]}>Genre</div>
                <div className={styles["preview-metadata-value"]}>
                  {PreviewGenre}
                </div>
              </div>
            </div>
            <div className={styles["preview-audio"]}>
              <audio
                src={
                  activeTab == "standard"
                    ? lowQuality
                      ? URL.createObjectURL(lowQuality)
                      : ""
                    : highQuality
                    ? URL.createObjectURL(highQuality)
                    : ""
                }
                controls
                className={styles["preview-audio-player"]}
              />
              {/* <div className={styles["preview-audio-controls"]}>
                <div className={styles["preview-audio-progress"]}></div>
              </div>
              <div className={styles["preview-audio-times"]}>
                <span>0:58</span>
                <span>3:24</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Preview;
