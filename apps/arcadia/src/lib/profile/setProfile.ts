import { Profile, SetProfile } from "@/types";
import { arweave } from "@/lib/arweave";
import { getIrys, uploadFile } from "../irys";

export const setProfile = async ({
  values,
  profile,
  address,
}: {
  values: SetProfile;
  profile: Profile | undefined;
  address: string;
}) => {
  try {
    let avatarId: string = "";
    let bannerId: string = "";

    if (values.avatar && values.avatar.size > 0) {
      const avatarTx = await uploadFile(values.avatar, [
        { name: "Content-Type", value: values.avatar.type },
      ]);

      avatarId = avatarTx.id;
    }

    if (values.banner && values.banner.size > 0) {
      const bannerTx = await uploadFile(values.banner, [
        { name: "Content-Type", value: values.banner.type },
      ]);

      bannerId = bannerTx.id;
    }

    const name = values.name || profile?.name || "";
    const handle = values.handle || profile?.handle || "";
    const bio = values.bio || profile?.bio || "";
    const avatar = avatarId || profile?.avatarId || "";
    const banner = bannerId || profile?.bannerId || "";

    const profileJSON = JSON.stringify({
      handle,
      uniqueHandle: `${values.handle || profile?.handle || "user"}#${address}`,
      name,
      bio,
      avatar,
      banner,
      updatedAt: Date.now(),
    });

    const profileTx = await arweave.createTransaction({
      data: profileJSON,
    });
    profileTx.addTag("Content-Type", "application/json");
    profileTx.addTag("Type", "test-profile");
    profileTx.addTag("Name", name);
    profileTx.addTag("Handle", handle);
    profileTx.addTag("Bio", bio);
    profileTx.addTag("Avatar", avatar);
    profileTx.addTag("Banner", banner);

    //temp
    profileTx.addTag("DApp-Name", "arcadia-v2");
    console.log("profileTx", profileTx);

    const profileTxResult = await window.arweaveWallet.dispatch(profileTx);

    return profileTxResult.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
