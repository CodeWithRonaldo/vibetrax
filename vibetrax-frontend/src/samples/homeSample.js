import {
  FaSearch as SearchIcon,
  FaHeadphones as HeadPhoneIcon,
} from "react-icons/fa";
import { TbBrandCashapp as CashIcon } from "react-icons/tb";
import { LiaHandshake as ShakeIcon} from "react-icons/lia";
import {
  MdOutlineElectricBolt as BoltIcon,
  MdOutlineInsertChart as ChartIcon} from "react-icons/md";


export const featuresData = [
  {
    icon: CashIcon,
    title: "Fair Revenue Distribution",
    description:
      "Artists and contributors receive automatic royalty payments with predetermined splits, ensuring fair compensation for everyone involved.",
  },
  {
    icon: SearchIcon,
    title: "Full Transparency",
    description:
      "Real-time visibility into royalties, streaming data, and fan engagement through blockchain technology.",
  },
  {
    icon: HeadPhoneIcon,
    title: "Quality Tiers",
    description:
      "Sample music in standard quality, then unlock premium high-fidelity streaming by supporting your favorite artists.",
  },
  {
    icon: ShakeIcon,
    title: "Direct Artist-Fan Connection",
    description:
      "Support artists directly and gain access to exclusive content, early releases, and special perks.",
  },
  {
    icon: BoltIcon,
    title: "Instant Payments",
    description:
      "Smart contracts handle automatic royalty splits on every sale and stream, with instant payouts to all contributors.",
  },
  {
    icon: ChartIcon,
    title: "Performance Analytics",
    description:
      "Comprehensive dashboard with real-time data on streams, sales, and royalties for artists.",
  },
];

export const stepsData = [
  {
    number: 1,
    title: "Artists Upload Music",
    description:
      "Upload both standard and high-quality versions of your music and set royalty splits for all contributors.",
  },
  {
    number: 2,
    title: "Fans Discover Music",
    description:
      "Browse the platform and listen to standard quality streams of any track for free.",
  },
  {
    number: 3,
    title: "Unlock Premium",
    description:
      "Purchase access to high-quality versions and exclusive content from your favorite artists.",
  },
  {
    number: 4,
    title: "Automatic Royalties",
    description:
      "Every purchase automatically distributes payments to all contributors based on preset splits.",
  },
];

export const testimonialsData = [
  {
    text: "VibeTrax has completely changed how I release music. I can finally ensure everyone who contributed gets paid fairly and instantly.",
    authorName: "Michael Rivers",
    authorTitle: "Independent Artist",
    authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    text: "As a producer, I often had to chase payments. With VibeTrax, I get my fair share instantly whenever a track sells or streams.",
    authorName: "Jenna Kim",
    authorTitle: "Music Producer",
    authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    text: "The transparency is incredible. I can see exactly how my music is performing and where my royalties are coming from in real-time.",
    authorName: "David Okafor",
    authorTitle: "Singer-Songwriter",
    authorImage: "https://randomuser.me/api/portraits/men/74.jpg",
  },
];
