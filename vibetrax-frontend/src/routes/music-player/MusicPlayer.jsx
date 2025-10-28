import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import styles from "./MusicPlayer.module.css";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import SongDetails from "../../components/song-details/SongDetails";
import { useMusicActions } from "../../hooks/useMusicActions";
import PremiumModal from "../../modals/premium-modal/PremiumModal";
import CtaComponent from "../../components/cta-section/CtaComponent";
import Contributors from "../../components/contributors/Contributors";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { EmptyState } from "../../components/state/EmptyState";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { useNetworkVariable } from "../../config/networkConfig";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";
import { useCurrentAccount, useIotaClientQuery } from "@iota/dapp-kit";

const MusicPlayer = () => {
  const { id } = useParams();
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
    }
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
    { select: (data) => data.data?.content }
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isSubcribeModalOpen, setIsSubcribeModalOpen] = useState(false);
  const [comment, setComment] = useState("");

  const artistMusics = musicNfts.filter(
    (music) => music.artist === songData?.fields?.artist && music?.id?.id !== id
  );

  const forSale = songData?.fields?.for_sale === true;

  const isPremium =
    currentAccount?.address === songData?.fields?.current_owner ||
    songData?.fields?.collaborators.includes(currentAccount?.address) ||
    (subscriberData && subscriberData.length > 0);

  if (isPending) return <LoadingState />;
  if (isError || !songData) return <ErrorState />;

  return (
    <main className={styles.mainContent}>
      <SongDetails
        isPremium={isPremium}
        songData={songData}
        handleVote={() => voteForTrack(id, votersData)}
      />

      <div>
        <CtaComponent
          isHome={false}
          title={isPremium ? "You're Premium!" : "Upgrade to Premium Quality"}
          subtitle={
            isPremium
              ? "Enjoy your high-fidelity 320kbps audio experience."
              : "Experience this track in high-fidelity 320kbps audio quality."
          }
          buttonText={`Purchase for ${songData?.fields.price} IOTA`}
          handleClick={() => setIsOpen(true)}
          handleSubscribeClick={() => setIsSubcribeModalOpen(true)}
          forSale={forSale}
          isPremium={isPremium}
        />

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
      </div>

      <Contributors
        contributors={songData?.fields.collaborators}
        splits={songData?.fields.collaborator_splits}
        roles={songData?.fields.collaborator_roles}
        price={songData?.fields.price}
        royalty_percentage={songData?.fields.royalty_percentage}
      />

      <div>
        <h2 className={styles.sectionTitle}>
          More from Artist {songData?.fields?.artist.slice(0, 5)}...
          {songData?.fields?.artist.slice(-5)}
        </h2>
        {artistMusicPending && <LoadingState />}
        {artistMusicError && <ErrorState />}
        {artistMusics.length === 0 && (
          <EmptyState message="Artist has no other music" />
        )}
        <div className={styles.row}>
          {artistMusics.map((track) => (
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
      </div>

      <div className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>Comments</h2>
        <div className={styles.commentForm}>
          <div className={styles.commentInputContainer}>
            <input
              type="text"
              placeholder="Add a comment..."
              className={styles.commentInput}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className={styles.commentBtn}>
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MusicPlayer;
