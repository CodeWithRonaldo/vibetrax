import { createNetworkConfig } from "@iota/dapp-kit";
import { getFullnodeUrl } from "@iota/iota-sdk/client";
import {
  TESTNET_TUNE_FLOW_PACKAGE_ID,
  TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
  TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
  TESTNET_TUNE_FLOW_TOKEN_ID,
  TESTNET_TUNE_FLOW_TREASURY_ID,
} from "./constants.js";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        tunflowPackageId: TESTNET_TUNE_FLOW_PACKAGE_ID,
        tunflowTokenId: TESTNET_TUNE_FLOW_TOKEN_ID,
        tunflowNFTRegistryId: TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
        tunflowSubscriptionId: TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
        tunflowTreasuryId: TESTNET_TUNE_FLOW_TREASURY_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
