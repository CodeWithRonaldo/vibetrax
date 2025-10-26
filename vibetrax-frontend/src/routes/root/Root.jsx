import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import styles from "./Root.module.css";
import Footer from "../../components/footer/Footer";
import { useCurrentAccount, useIotaClientQuery } from "@iota/dapp-kit";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import { useNetworkVariable } from "../../config/networkConfig";

const Root = () => {
  const currentAccount = useCurrentAccount();

  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  const { data: subscriberData } = useIotaClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${tunflowPackageId}::vibetrax::SubscriptionPurchased`,
      },
    },
    {
      select: (data) =>
        data.data
          .flatMap((x) => x.parsedJson)
          .filter((y) => y.user === currentAccount.address),
    }
  );

  return (
    <div className={styles.root}>
      <ScrollToTop />
      <Header />
      <Toaster position="top-center" />
      <Outlet context={subscriberData} />
      <Footer />
    </div>
  );
};

export default Root;
