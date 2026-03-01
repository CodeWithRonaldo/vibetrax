import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import MusicCard from "../../components/cards/music-card/MusicCard";
import { FiPlay, FiArrowRight } from "react-icons/fi";
import { useMemo } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { musicNfts, isPending } = useMusicNfts();

  // Get trending tracks
  const trendingTracks = useMemo(
    () =>
      musicNfts
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
        .slice(0, 1)[0],
    [musicNfts],
  );

  // Get recently added
  const recentTracks = useMemo(() => musicNfts.slice(0, 8), [musicNfts]);

  // Get recommendations (shuffled once)
  const recommendedTracks = useMemo(() => {
    const shuffled = [...musicNfts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [musicNfts]);

  if (isPending) return <LoadingState />;

  return (
    <main className={styles.home}>
      {/* Hero Section with Featured Track */}
      {trendingTracks && (
        <section className={styles.heroSection}>
          <div
            className={styles.heroBg}
            style={{
              backgroundImage: `url(${trendingTracks.music_art})`,
            }}
          >
            <div className={styles.heroOverlay}></div>
            <div className={styles.heroContent}>
              <span className={styles.heroLabel}>Now Trending</span>
              <h1 className={styles.heroTitle}>{trendingTracks.title}</h1>
              <p className={styles.heroArtist}>
                {trendingTracks.artist.slice(0, 8)}...
              </p>
              <button
                className={styles.playBtn}
                onClick={() => navigate(`/discover/${trendingTracks.id.id}`)}
              >
                <FiPlay /> Play Now
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recently Added</h2>
          <button
            className={styles.seeAll}
            onClick={() => navigate("/discover")}
          >
            See All <FiArrowRight />
          </button>
        </div>
        <div className={styles.tracksGrid}>
          {recentTracks.map((track) => (
            <MusicCard key={track.id.id} track={track} quality="Standard" />
          ))}
        </div>
      </section>

      {/* Recommended For You */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recommended For You</h2>
          <button
            className={styles.seeAll}
            onClick={() => navigate("/discover")}
          >
            See All <FiArrowRight />
          </button>
        </div>
        <div className={styles.tracksGrid}>
          {recommendedTracks.map((track) => (
            <MusicCard key={track.id.id} track={track} quality="Standard" />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
