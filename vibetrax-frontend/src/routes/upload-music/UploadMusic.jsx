import { useState } from "react";
import Form from "../../components/form/Form";
import Preview from "../../components/preview/Preview";
import styles from "./UploadMusic.module.css";
import { useCurrentAccount } from "@iota/dapp-kit";

const UploadMusic = () => {
  const [previewClicked, setPreviewClicked] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [PreviewGenre, setPreviewGenre] = useState(null);
  const [highQuality, setHighQuality] = useState(null);
  const [lowQuality, setLowQuality] = useState(null);
  const currentAccount = useCurrentAccount();

  const showPreview = (e) => {
    e.preventDefault();
    setPreviewClicked(!previewClicked);
  };
  return (
    <main className={styles["main-content"]}>
      <h1 className={styles["page-title"]}>Upload Your Music</h1>
      <p className={styles["page-subtitle"]}>
        Share your music with the world and set up fair revenue distribution for
        all your contributors.
      </p>
      <div className={styles["hint"]}>
        You need at least 0.1 iota for transaction fees
        <a href={"#"} target="blank">
          Get Gas Fee
        </a>
      </div>
      <div className={styles["upload-container"]}>
        <Form
          showPreview={showPreview}
          setPreviewTitle={setPreviewTitle}
          setPreviewImage={setPreviewImage}
          setPreviewGenre={setPreviewGenre}
          setHighQuality={setHighQuality}
          setLowQuality={setLowQuality}
        />
      </div>
      {previewClicked && (
        <Preview
          previewTitle={previewTitle}
          PreviewImage={previewImage}
          PreviewGenre={PreviewGenre}
          highQuality={highQuality}
          lowQuality={lowQuality}
        />
      )}
    </main>
  );
};

export default UploadMusic;
