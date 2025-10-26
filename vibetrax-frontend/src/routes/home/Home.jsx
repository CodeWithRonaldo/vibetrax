import Banner from "../../components/banner/Banner";
import CtaComponent from "../../components/cta-section/CtaComponent";
import SectionContainer from "../../components/section-container/SectionContainer";

import {
  featuresData,
  stepsData,
  testimonialsData,
} from "../../samples/homeSample";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.home}>
      <Banner />
      <SectionContainer
        title={"Why VibeTrax?"}
        type="features"
        items={featuresData}
        backgroundColor="var(--color-bg-secondary)"
      />
      <SectionContainer
        title={"How it works?"}
        type="steps"
        items={stepsData}
      />
      <SectionContainer
        title={"Artist Success Stories"}
        type="testimonials"
        items={testimonialsData}
        backgroundColor="var(--color-bg-secondary)"
      />
      <CtaComponent
        title="Ready to Transform Your Music Experience?"
        subtitle="Join VibeTrax today and be part of the revolution that's creating a fairer, more transparent music ecosystem for artists and fans alike."
        buttonText="Get Started Today"
        handleClick={() => navigate("discover")}
      />
    </main>
  );
};

export default Home;
