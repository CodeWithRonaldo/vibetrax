import { useIotaClient, useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { useNetworkVariables } from "../config/networkConfig";
import toast from "react-hot-toast";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useNavigate } from "react-router-dom";

export const useMusicUpload = () => {
  const navigate = useNavigate();
  const { tunflowPackageId, tunflowNFTRegistryId } = useNetworkVariables(
    "tunflowPackageId",
    "tunflowNFTRegistryId"
  );
  const iotaClient = useIotaClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const uploadMusic = async (
    toastId,
    title,
    description,
    genre,
    imageUrl,
    highQualityUrl,
    lowQualityUrl,
    price,
    royaltyPercentage,
    collaborators,
    collaboratorRoles,
    collaboratorSplits
  ) => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        arguments: [
          tx.object(tunflowNFTRegistryId),
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.string(genre),
          tx.pure.string(imageUrl),
          tx.pure.string(highQualityUrl),
          tx.pure.string(lowQualityUrl),
          tx.pure.u64(Number(price)),
          tx.pure.u64(Number(royaltyPercentage * 100)),
          tx.pure.vector(
            "address",
            collaborators.map((c) => c.address)
          ),
          tx.pure.vector("string", collaboratorRoles),
          tx.pure.vector("u64", collaboratorSplits),
        ],
        target: `${tunflowPackageId}::vibetrax::mint_music_nft`,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            await iotaClient.waitForTransaction({ digest });
            toast.dismiss(toastId);
            toast.success("Music uploaded successfully!");
            navigate("/discover");
            return true;
          },
          onError: (error) => {
            toast.dismiss(toastId);
            toast.error(`Upload failed`);
            console.error(error);

            return false;
          },
        }
      );
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred, try again");
      console.log("catch error", error);
      return false;
    }
  };

  const updateMusic = async (
    toastId,
    id,
    title,
    description,
    genre,
    imageUrl,
    highQualityUrl,
    lowQualityUrl,
    price,
    forSale,
    collaborators,
    collaboratorRoles,
    collaboratorSplits
  ) => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        arguments: [
          tx.object(id),
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.string(genre),
          tx.pure.string(imageUrl),
          tx.pure.string(highQualityUrl),
          tx.pure.string(lowQualityUrl),
          tx.pure.u64(Number(price)),
          tx.pure.bool(forSale),
          tx.pure.vector(
            "address",
            collaborators.map((c) => c.address)
          ),
          tx.pure.vector("string", collaboratorRoles),
          tx.pure.vector("u64", collaboratorSplits),
        ],
        target: `${tunflowPackageId}::vibetrax::update_music_details`,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            await iotaClient.waitForTransaction({ digest });
            toast.dismiss(toastId);
            toast.success("Music details updated successfully!", {
              id: toastId,
            });
            navigate("/discover");
            return true;
          },
          onError: (error) => {
            toast.dismiss(toastId);
            toast.error(`Update failed`, { id: toastId });
            console.error(error.message);
            return false;
          },
        }
      );
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred");
      console.error(error.message);
      return false;
    }
  };

  return { uploadMusic, updateMusic };
};
