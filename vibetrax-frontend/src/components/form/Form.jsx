import Button from "../button/Button";
import styles from "./Form.module.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PinataSDK } from "pinata";
import { useMusicUpload } from "../../hooks/useMusicUpload";
import { useParams } from "react-router-dom";
import { useCurrentAccount, useIotaClientQuery } from "@iota/dapp-kit";
// import { Tusky } from "@tusky-io/ts-sdk/web";

const Form = ({
  showPreview,
  setHighQuality,
  setLowQuality,
  setPreviewTitle,
  setPreviewImage,
  setPreviewGenre,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [price, setPrice] = useState(0);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [highQualityFile, setHighQualityFile] = useState(null);
  const [lowQualityFile, setLowQualityFile] = useState(null);
  const [forSale, setForSale] = useState(null);
  const [contributors, setContributors] = useState([]);
  const currentAccount = useCurrentAccount();
  const { uploadMusic, updateMusic } = useMusicUpload();
  const { id } = useParams();
  // uploading to tusky
  // const tusky = new Tusky({ apiKey: import.meta.env.VITE_TUSKY_API_KEY });

  // const upToTusky = async() =>{

  //   const vaults = await tusky.vault.listAll();
  //   console.log(vaults);

  //   const publicVault = vaults.find(vault => vault.name === "My public vault");
  //   let publicVaultId = publicVault?.id
  //   if(!publicVault){
  //     const { id } = await tusky.vault.create("My public vault", { encrypted: false });
  //     publicVaultId = id
  //   }
  //   const imageId = await tusky.file.upload(publicVaultId, imageFile);
  //   const imageData = await tusky.file.get(imageId);
  //   console.log(imageData.blobId);

  //   const lowQualityId = await tusky.file.upload(publicVaultId, lowQualityFile);
  //   const lowQualityData = await tusky.file.get(lowQualityId);
  //   console.log(lowQualityData.blobId);

  //   console.log(vaults);
  //   const privateVault = vaults.find(vault => vault.name === "My private vault");
  //   let privateVaultId = privateVault?.id
  //   if(!privateVault){
  //     await tusky.addEncrypter({ password: import.meta.env.VITE_TUSKY_ACCOUNT_PASSWORD })
  //     const { id } = await tusky.vault.create("My private vault", { encrypted: true });
  //     privateVaultId = id
  //   }
  //   const highQualityId = await tusky.file.upload(privateVaultId, highQualityFile);
  //   const highQualityAudioData = await tusky.file.get(highQualityId);
  //   console.log(highQualityAudioData.blobId);

  // }

  // function to fetch song details using id
  const { data: songData, isPending } = useIotaClientQuery(
    "getObject",
    { id, options: { showContent: true } },
    { select: (data) => data.data?.content }
  );

  // function go get image and music blob file
  const getBlobFile = async (blobUrl) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return blob;
  };

  // effect to update form
  useEffect(() => {
    if (id && !isPending) {
      setTitle(songData?.fields?.title);
      setPreviewTitle(songData?.fields?.title);
      setDescription(songData?.fields?.description);
      setGenre(songData?.fields?.genre);
      setPreviewGenre(songData?.fields?.genre);
      setForSale(songData?.fields?.for_sale);
      setPrice(songData?.fields?.price);
      getBlobFile(songData?.fields?.music_art).then((blob) => {
        setImageFile(blob);
        setPreviewImage(blob);
      });
      getBlobFile(songData?.fields?.high_quality_ipfs).then((blob) => {
        setHighQualityFile(blob);
        setHighQuality(blob);
      });
      getBlobFile(songData?.fields?.low_quality_ipfs).then((blob) => {
        setLowQualityFile(blob);
        setLowQuality(blob);
      });
      setContributors(
        songData?.fields?.collaborators.map((collaborator, index) => ({
          role: songData?.fields?.collaborator_roles[index],
          address: collaborator,
          percentage: songData?.fields?.collaborator_splits[index] / 100,
        }))
      );
    } else {
      if (currentAccount) {
        setContributors([
          {
            role: "Artist",
            address: currentAccount?.address,
            percentage: 50,
          },
        ]);
      }
    }
  }, [id, songData, isPending, currentAccount]);

  // Track remaining percentage
  const [_remainingPercentage, setRemainingPercentage] = useState(0);

  // Calculate remaining percentage whenever contributors change
  const calculateRemainingPercentage = () => {
    const total = contributors.reduce((sum, contributor) => {
      return sum + (parseInt(contributor.percentage) || 0);
    }, 0);
    return 100 - total;
  };

  // function to Add new contributor
  const addContributor = () => {
    if (calculateRemainingPercentage() <= 0) {
      toast.error("No percentage remaining to allocate");
      return;
    }

    setContributors([
      ...contributors,
      { role: "", address: "", percentage: 0 },
    ]);
  };

  //Function to Remove contributor
  const removeContributor = (index) => {
    if (index === 0) {
      toast.error("Cannot remove the main artist");
      return;
    }

    const updatedContributors = [...contributors];
    updatedContributors.splice(index, 1);
    setContributors(updatedContributors);
  };

  // Funtion to Update contributor
  const updateContributor = (index, field, value) => {
    const updatedContributors = [...contributors];
    updatedContributors[index] = {
      ...updatedContributors[index],
      [field]: value,
    };
    setContributors(updatedContributors);

    // Update remaining percentage
    setRemainingPercentage(calculateRemainingPercentage());
  };

  // const publisherUrl = "https://publisher.walrus-testnet.walrus.space";

  // const uploadMusicImageFile = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const [res1, res2, res3] = await Promise.all([
  //       fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": lowQualityFile.type || "application/octet-stream",
  //         },
  //         body: lowQualityFile,
  //       }),
  //       fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": highQualityFile.type || "application/octet-stream",
  //         },
  //         body: highQualityFile,
  //       }),
  //       fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": imageFile.type || "application/octet-stream",
  //         },
  //         body: imageFile,
  //       }),
  //     ]);

  //     const [result1, result2, result3] = await Promise.all([
  //       res1.json(),
  //       res2.json(),
  //       res3.json(),
  //     ]);

  //     const [blobId1, blobId2, blobId3] = [
  //       result1?.newlyCreated?.blobObject?.blobId ||
  //         result1?.alreadyCertified?.blobId,
  //       result2?.newlyCreated?.blobObject?.blobId ||
  //         result2?.alreadyCertified?.blobId,
  //       result3?.newlyCreated?.blobObject?.blobId ||
  //         result3?.alreadyCertified?.blobId,
  //     ];
  //     toast.success("files uploaded successfully, creating transaction", {
  //       duration: 5000,
  //     });
  //     return {
  //       lowQualityBlobId: blobId1,
  //       highQualityBlobId: blobId2,
  //       imageBlobId: blobId3,
  //     };
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //     toast.error("failed to upload files", {
  //       duration: 5000,
  //     });
  //   }
  // };

  // function to upload music to pinata

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
  });

  const uploadMusicImageFile = async (e) => {
    e.preventDefault();
    try {
      const ImageUpload = await pinata.upload.public.file(imageFile);
      const imageCid = ImageUpload.cid;

      const highQualityUpload = await pinata.upload.public.file(
        highQualityFile
      );
      const highQualityCid = highQualityUpload.cid;

      const lowQualityUpload = await pinata.upload.public.file(lowQualityFile);
      const lowQualityCid = lowQualityUpload.cid;

      console.log("files uploaded successfully");
      toast.success("files uploaded successfully, creating transaction", {
        duration: 5000,
      });

      return {
        imageCid: imageCid,
        highQualityCid: highQualityCid,
        lowQualityCid: lowQualityCid,
      };
    } catch (e) {
      console.error(e);
      toast.error("failed to upload files", {
        duration: 5000,
      });
    }
  };

  // function to upload music to smart contract

  const handleUpload = async (e) => {
    e.preventDefault();

    // Validate that percentages add up to 100%
    if (calculateRemainingPercentage() !== 0) {
      toast.error("Revenue distribution must total exactly 100%");
      return;
    }

    const toastId = toast.loading("Uploading...");

    const cIds = await uploadMusicImageFile(e);
    // const blobId = await uploadMusicImageFile(e);

    // if (!blobId) {
    //   toast.dismiss(toastId);
    //   return;
    // }

    // const { lowQualityBlobId, highQualityBlobId, imageBlobId } = blobId;
    if (!cIds) {
      toast.dismiss(toastId);
      return;
    }

    const { lowQualityCid, highQualityCid, imageCid } = cIds;

    const roles = contributors.map((c) => c.role);
    const percentages = contributors.map((c) => parseInt(c.percentage) * 100);

    uploadMusic(
      toastId,
      title,
      description,
      genre,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${imageCid}`,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${highQualityCid}`,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${lowQualityCid}`,
      price,
      royaltyPercentage,
      contributors,
      roles,
      percentages
    );
  };

  // function to update music

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate that percentages add up to 100%
    if (calculateRemainingPercentage() !== 0) {
      toast.error("Revenue distribution must total exactly 100%");
      return;
    }

    const toastId = toast.loading("Updating...");

    const cIds = await uploadMusicImageFile(e);
    // const blobId = await uploadMusicImageFile(e);
    // if (!blobId) {
    //   toast.dismiss(toastId);
    //   return;
    // }

    if (!cIds) {
      toast.dismiss(toastId);
      return;
    }

    const { lowQualityCid, highQualityCid, imageCid } = cIds;
    // const { lowQualityBlobId, highQualityBlobId, imageBlobId } = blobId;

    const roles = contributors.map((c) => c.role);
    const percentages = contributors.map((c) => parseInt(c.percentage) * 100);

    updateMusic(
      toastId,
      id,
      title,
      description,
      genre,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${imageCid}`,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${highQualityCid}`,
      `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${lowQualityCid}`,
      price,
      forSale,
      contributors,
      roles,
      percentages
    );
  };

  return (
    <>
      <form onSubmit={id ? handleUpdate : handleUpload}>
        {/* Basic Info */}
        <div className={styles["form-group"]}>
          <label className={styles["form-label"]} htmlFor="title">
            Track Title
          </label>
          <input
            type="text"
            id="title"
            className={styles["form-input"]}
            placeholder="Enter track title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPreviewTitle(e.target.value);
            }}
          />
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["form-label"]} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={styles["form-textarea"]}
            placeholder="Tell us about your track... (max 500 characters)"
            value={description}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["form-label"]} htmlFor="genre">
            Genre
          </label>
          <select
            id="genre"
            className={styles["form-select"]}
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPreviewGenre(e.target.value);
            }}
          >
            <option value="" disabled>
              Select a genre
            </option>
            <option value="pop">Pop</option>
            <option value="hiphop">Hip Hop</option>
            <option value="rnb">R&B</option>
            <option value="rock">Rock</option>
            <option value="electronic">Electronic</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="afrobeat">Afrobeat</option>
            <option value="latin">Latin</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* File Uploads */}
        <div className={styles["form-group"]}>
          <label className={styles["form-label"]}>
            Upload Standard Quality Track
          </label>
          <div
            className={`${styles["file-upload"]} ${
              lowQualityFile ? styles["file-selected"] : ""
            }`}
          >
            <input
              type="file"
              id="standard-quality"
              accept="audio/*, .mp3, .aac, .ogg, .wav, .flac, .m4a"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setLowQualityFile(e.target.files[0]);
                  setLowQuality(e.target.files[0]);
                }
              }}
            />
            <div className={styles["upload-icon"]}>
              {lowQualityFile ? "✓" : "🎵"}
            </div>
            <div className={styles["upload-text"]}>
              {lowQualityFile ? (
                <>
                  <strong className={styles["file-name"]}>
                    {lowQualityFile.name}
                  </strong>
                  <p>{(lowQualityFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <strong>
                    Click or drag to upload standard quality track
                  </strong>
                  <p>MP3 format, max size 20MB</p>
                </>
              )}
            </div>
            {lowQualityFile && (
              <button
                type="button"
                className={styles["remove-file"]}
                onClick={(e) => {
                  e.preventDefault();
                  setLowQualityFile(null);
                  setLowQuality(null);
                  document.getElementById("standard-quality").value = "";
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["form-label"]}>
            Upload Premium Quality Track
          </label>
          <div
            className={`${styles["file-upload"]} ${
              highQualityFile ? styles["file-selected"] : ""
            }`}
          >
            <input
              type="file"
              id="premium-quality"
              accept="audio/*, .mp3, .aac, .ogg, .wav, .flac, .m4a"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setHighQualityFile(e.target.files[0]);
                  setHighQuality(e.target.files[0]);
                }
              }}
            />
            <div className={styles["upload-icon"]}>
              {highQualityFile ? "✓" : "🎧"}
            </div>
            <div className={styles["upload-text"]}>
              {highQualityFile ? (
                <>
                  <strong className={styles["file-name"]}>
                    {highQualityFile.name}
                  </strong>
                  <p>{(highQualityFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <strong>Click or drag to upload high quality track</strong>
                  <p>FLAC or WAV format, max size 50MB</p>
                </>
              )}
            </div>
            {highQualityFile && (
              <button
                type="button"
                className={styles["remove-file"]}
                onClick={(e) => {
                  e.preventDefault();
                  setHighQualityFile(null);
                  setHighQuality(null);
                  document.getElementById("premium-quality").value = "";
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["form-label"]}>Upload Artwork</label>
          <div
            className={`${styles["file-upload"]} ${
              imageFile ? styles["file-selected"] : ""
            }`}
          >
            <input
              type="file"
              id="artwork-file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  setPreviewImage(e.target.files[0]);
                }
              }}
            />
            <div className={styles["upload-icon"]}>
              {imageFile ? "✓" : "🖼️"}
            </div>
            <div className={styles["upload-text"]}>
              {imageFile ? (
                <>
                  <strong className={styles["file-name"]}>
                    {imageFile.name}
                  </strong>
                  <p>{(imageFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  {imageFile.type.includes("image") && (
                    <div className={styles["image-preview"]}>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className={styles["preview-thumbnail"]}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <strong>Click or drag to upload artwork</strong>
                  <p>JPG or PNG format, minimum 1000x1000px</p>
                </>
              )}
            </div>
            {imageFile && (
              <button
                type="button"
                className={styles["remove-file"]}
                onClick={(e) => {
                  e.preventDefault();
                  setImageFile(null);
                  setPreviewImage(null);
                  document.getElementById("artwork-file").value = "";
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className={styles["form-group"]}>
          <label className={styles["form-label"]} htmlFor="royalty">
            Royalty Percentage
          </label>
          <input
            type="number"
            id="royalty"
            className={styles["form-input"]}
            placeholder="Enter the royalty splitting percentage (maximum of 50%)"
            value={royaltyPercentage}
            onChange={(e) => setRoyaltyPercentage(e.target.value)}
            step="1"
            min="0"
            max="50"
          />
        </div>

        {/* Revenue Distribution - Updated Section */}
        <h3 className={styles["section-title"]}>Revenue Distribution</h3>

        {contributors.map((contributor, index) => (
          <div className={styles["contributor"]} key={index}>
            <div className={styles["contributor-role-container"]}>
              {index === 0 ? (
                <div className={styles["contributor-role"]}>You (Artist)</div>
              ) : (
                <input
                  type="text"
                  className={styles["contributor-input-role"]}
                  placeholder="Role (e.g., Producer, Writer)"
                  value={contributor.role}
                  onChange={(e) =>
                    updateContributor(index, "role", e.target.value)
                  }
                />
              )}
            </div>

            <input
              type="text"
              value={contributor.address}
              onChange={(e) =>
                updateContributor(index, "address", e.target.value)
              }
              placeholder="Enter wallet address"
              className={styles["contributor-input-address"]}
              disabled={index === 0}
            />

            <div className={styles["contributor-input-container"]}>
              <input
                type="number"
                className={styles["contributor-input"]}
                value={contributor.percentage}
                onChange={(e) =>
                  updateContributor(index, "percentage", e.target.value)
                }
                min="0"
                max="50"
                placeholder="%"
              />
              <span>%</span>

              {index !== 0 && (
                <button
                  type="button"
                  className={styles["remove-contributor"]}
                  onClick={() => removeContributor(index)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        <div className={styles["add-contributor"]} onClick={addContributor}>
          <div className={styles["add-icon"]}>+</div>
          <div>Add another contributor</div>
        </div>

        <div
          className={styles["remaining"]}
          style={{
            color: calculateRemainingPercentage() < 0 ? "red" : "inherit",
          }}
        >
          Remaining allocation: <span>{calculateRemainingPercentage()}%</span>
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["form-label"]} htmlFor="price">
            Premium Access Price (IOTA)
          </label>
          <input
            type="number"
            id="price"
            className={styles["form-input"]}
            placeholder="Enter price in IOTA"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.0001"
            min="0"
          />
        </div>

        <div className={styles["upload-actions"]}>
          <Button
            btnClass={"secondary"}
            text={"Preview"}
            onClick={showPreview}
          />
          <Button
            btnClass={"primary"}
            text={id ? "Update Track" : "Upload Track"}
          />
        </div>
      </form>
    </>
  );
};

export default Form;
