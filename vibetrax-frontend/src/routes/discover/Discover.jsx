import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiSearch, FiPlay } from "react-icons/fi";
import styles from "./Discover.module.css";
import { useMusicNfts } from "../../hooks/useMusicNfts";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import MusicCard from "../../components/cards/music-card/MusicCard";
import SubscribeBanner from "../../components/subscribe-banner/SubscribeBanner";
import { useCurrentAccount } from "@iota/dapp-kit";

const Discover = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeGenre, setActiveGenre] = useState("All Genres");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const subscriberData = useOutletContext();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const carouselIntervalRef = useRef(null);
  const genreScrollRef = useRef(null);

  const { musicNfts, isPending, isError } = useMusicNfts();

  const isSubscribed = subscriberData?.length > 0;

  const genres = [
    "All Genres",
    "Pop",
    "HipHop",
    "R&B",
    "Rock",
    "Electronic",
    "Jazz",
    "Classical",
    "Afrobeat",
    "Latin",
  ];

  const featuredMusic = musicNfts
    .filter((track) => track.vote_count > 0)
    .sort((a, b) => {
      const aVotes = a.vote_count || 0;
      const bVotes = b.vote_count || 0;
      return bVotes - aVotes;
    })
    .slice(0, 5);

  const otherMusic = musicNfts;

  // Scroll active genre into view when changed
  useEffect(() => {
    if (genreScrollRef.current) {
      const activeElement = genreScrollRef.current.querySelector(
        `.${styles.active}`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeGenre]);

  // Carousel rotation and pause on touch
  useEffect(() => {
    if (featuredMusic.length === 0 || isTouching) return;

    carouselIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMusic.length);
    }, 5000);

    return () => clearInterval(carouselIntervalRef.current);
  }, [featuredMusic.length, isTouching]);

  const handleCarouselTouch = () => {
    setIsTouching(true);
    // Resume auto-rotation after 10 seconds of inactivity
    setTimeout(() => setIsTouching(false), 10000);
  };

  const filteredMusic = otherMusic.filter((track) => {
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "songs" && !track.is_album) ||
      (activeTab === "albums" && track.is_album);

    const genreMatch =
      activeGenre === "All Genres" ||
      track.genre?.toLowerCase() === activeGenre.toLowerCase();

    const searchMatch =
      searchQuery === "" ||
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && genreMatch && searchMatch;
  });

  // Debounce search input to improve performance
  const handleSearchChange = (e) => {
    const value = e.target.value;

    // Clear any existing timeouts
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set a timeout to update state after user stops typing
    window.searchTimeout = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState />;

  return (
    <main className={styles.mainContent}>
      {!isSubscribed && <SubscribeBanner subscriberData={subscriberData} />}

      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Discover Music</h1>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for artists, songs, or albums..."
            defaultValue={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search music"
          />
          <FiSearch className={styles.searchIcon} />
        </div>
      </div>

      {featuredMusic.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Music</h2>
            <div className={styles.carouselIndicators}>
              {featuredMusic.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.carouselIndicator} ${
                    i === currentSlide ? styles.active : ""
                  }`}
                  onClick={() => {
                    setCurrentSlide(i);
                    setIsTouching(true);
                    setTimeout(() => setIsTouching(false), 10000);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div
            className={styles.carousel}
            onTouchStart={handleCarouselTouch}
            onClick={handleCarouselTouch}
          >
            <div
              className={styles.carouselSlide}
              style={{
                backgroundImage: `url(${featuredMusic[currentSlide].music_art})`,
              }}
            >
              <div className={styles.carouselOverlay}>
                <div className={styles.carouselContent}>
                  <span className={styles.featuredBadge}>Featured</span>
                  <h3>{featuredMusic[currentSlide].title}</h3>
                  <p>{featuredMusic[currentSlide].artist}</p>
                  <button
                    className={styles.playButton}
                    onClick={() =>
                      navigate(`/discover/${featuredMusic[currentSlide].id.id}`)
                    }
                    aria-label={`Play ${featuredMusic[currentSlide].title}`}
                  >
                    <FiPlay />
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.musicSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Browse Music</h2>
          <div className={styles.tabsControls}>
            {["all", "songs", "albums"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabButton} ${
                  activeTab === tab ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab)}
                aria-label={`Show ${tab}`}
                aria-pressed={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.genreFiltersContainer} ref={genreScrollRef}>
          <div className={styles.genreFilters}>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`${styles.genrePill} ${
                  genre === activeGenre ? styles.active : ""
                }`}
                onClick={() => setActiveGenre(genre)}
                aria-label={`Filter by ${genre}`}
                aria-pressed={genre === activeGenre}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.musicGrid}>
          {filteredMusic.length > 0 ? (
            filteredMusic.map((track) => (
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
            ))
          ) : (
            <EmptyState
              message={searchQuery ? "No results found" : "No music available"}
              subMessage={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Check back later!"
              }
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default Discover;
