import { useState } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiShare2, FiChevronDown } from "react-icons/fi";
import styles from "./MusicPlayer.module.css";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import SongDetails from "../../components/song-details/SongDetails";
import { useMusicActions } from "../../hooks/useMusicActions";
import PremiumModal from "../../modals/premium-modal/PremiumModal";
import Contributors from "../../components/contributors/Contributors";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { EmptyState } from "../../components/state/EmptyState";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { useNetworkVariable } from "../../config/networkConfig";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";
import { useCurrentAccount, useIotaClientQuery } from "@iota/dapp-kit";

const MusicPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const subscriberData = useOutletContext();
  const currentAccount = useCurrentAccount();
  const { voteForTrack, purchaseTrack } = useMusicActions();
  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  const { data: votersData } = useIotaClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${tunflowPackageId}::vibetrax::NFTVoted`,
      },
    },
    {
      select: (data) =>
        data.data
          .flatMap((x) => x.parsedJson)
          .filter((y) => y.voter === currentAccount.address && y.nft_id == id),
    },
  );

  const {
    musicNfts,
    isPending: artistMusicPending,
    isError: artistMusicError,
  } = useMusicNfts();

  const {
    data: songData,
    isPending,
    isError,
  } = useIotaClientQuery(
    "getObject",
    { id, options: { showContent: true } },
    { select: (data) => data.data?.content },
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isSubcribeModalOpen, setIsSubcribeModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const artistMusics = musicNfts.filter(
    (music) =>
      music.artist === songData?.fields?.artist && music?.id?.id !== id,
  );

  const forSale = songData?.fields?.for_sale === true;

  const isPremium =
    currentAccount?.address === songData?.fields?.current_owner ||
    songData?.fields?.collaborators.includes(currentAccount?.address) ||
    (subscriberData && subscriberData.length > 0);

  if (isPending) return <LoadingState />;
  if (isError || !songData) return <ErrorState />;

  return (
    <main className={styles.playerContainer}>
      {/* Top Header */}
      <div className={styles.playerHeader}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/discover")}
        >
          <FiChevronDown />
        </button>
        <div className={styles.headerTitle}>Now Playing</div>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* Large Album Art Hero */}
      <div
        className={styles.albumHero}
        style={{
          backgroundImage: `url(${songData.fields.music_art})`,
        }}
      >
        <div className={styles.albumOverlay}></div>
        <div className={styles.albumArtContainer}>
          <img
            src={songData.fields.music_art}
            alt={songData.fields.title}
            className={styles.albumArt}
          />
        </div>
      </div>

      {/* Track Info & Controls */}
      <div className={styles.trackInfoContainer}>
        <div className={styles.trackHeader}>
          <div className={styles.trackMeta}>
            <h1 className={styles.trackTitle}>{songData.fields.title}</h1>
            <p className={styles.trackArtist}>
              {songData.fields.artist.slice(0, 8)}...
            </p>
          </div>
          <button
            className={`${styles.likeBtn} ${isLiked ? styles.liked : ""}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <FiHeart />
          </button>
        </div>

        {/* Player Component */}
        <SongDetails
          isPremium={isPremium}
          songData={songData}
          handleVote={() => voteForTrack(id, votersData)}
        />

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {forSale && (
            <button
              className={styles.upgradeBtn}
              onClick={() => setIsOpen(true)}
            >
              Unlock Premium
            </button>
          )}
          <button className={styles.shareBtn}>
            <FiShare2 /> Share
          </button>
        </div>
      </div>

      {/* Modals */}
      <PremiumModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        songData={songData}
        onPurchase={() => purchaseTrack(id, songData?.fields.price)}
      />

      <SubscribeModal
        isOpen={isSubcribeModalOpen}
        onClose={() => setIsSubcribeModalOpen(false)}
      />

      {/* Credits Section */}
      {songData?.fields?.collaborators &&
        songData.fields.collaborators.length > 0 && (
          <section className={styles.creditsSection}>
            <h2 className={styles.sectionTitle}>Credits</h2>
            <Contributors
              contributors={songData?.fields.collaborators}
              splits={songData?.fields.collaborator_splits}
              roles={songData?.fields.collaborator_roles}
              price={songData?.fields.price}
              royalty_percentage={songData?.fields.royalty_percentage}
            />
          </section>
        )}

      {/* More from Artist */}
      {artistMusics.length > 0 && (
        <section className={styles.moreSection}>
          <h2 className={styles.sectionTitle}>More from this artist</h2>
          {artistMusicPending && <LoadingState />}
          {artistMusicError && <ErrorState />}
          <div className={styles.tracksGrid}>
            {artistMusics.slice(0, 6).map((track) => (
              <MusicCard
                key={track.id.id}
                track={track}
                quality={
                  currentAccount?.address === track?.current_owner ||
                  track?.collaborators.includes(currentAccount?.address) ||
                  (subscriberData && subscriberData.length > 0)
                    ? "Premium"
                    : "Standard"
                }
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default MusicPlayer;
