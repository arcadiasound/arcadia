import { sleep } from "@/utils";
import { readMessageResult, sendMessage, spawnProcess } from "../ao";
import { gql } from "../helpers/gql";
import { gql as gqlNoTags } from "../helpers";
import { profileProcessTemplate } from "./processes/profileTemplate";
import { dryrun } from "@permaweb/aoconnect";
import { ProfileInfo, SetProfile } from "@/types";
import { uploadFile } from "../irys";

const PROFILE_NAME = "Profile-Test3";

export const updateProfile = async ({
  profile,
  values,
  processId,
}: {
  values: SetProfile;
  profile: ProfileInfo | undefined;
  processId: string | undefined;
}) => {
  if (!processId) {
    throw new Error("Process ID is required.");
  }

  let avatarId: string = "";
  let bannerId: string = "";

  if (values.avatar && values.avatar.size > 0) {
    try {
      const avatarTx = await uploadFile(values.avatar, [
        { name: "Content-Type", value: values.avatar.type },
      ]);

      avatarId = avatarTx.id;
    } catch (error) {
      console.error(error);
      throw new Error("Avatar failed to upload");
    }
  }

  if (values.banner && values.banner.size > 0) {
    try {
      const bannerTx = await uploadFile(values.banner, [
        { name: "Content-Type", value: values.banner.type },
      ]);

      bannerId = bannerTx.id;
    } catch (error) {
      console.error(error);
      throw new Error("Banner failed to upload");
    }
  }

  const name = values.name || profile?.name || "";
  const handle = values.handle || profile?.handle || "";
  const bio = values.bio || profile?.bio || "";
  const avatar = avatarId || profile?.avatar || "";
  const banner = bannerId || profile?.banner || "";

  const profileJSON = JSON.stringify({
    name,
    handle,
    bio,
    avatar,
    banner,
    // updatedAt: Date.now(),
  });

  try {
    const messageId = await sendMessage({
      processId,
      action: "Update",
      data: profileJSON,
      tags: [
        {
          name: "Name",
          value: name,
        },
        {
          name: "Handle",
          value: handle,
        },
        {
          name: "Bio",
          value: bio,
        },
        {
          name: "Avatar",
          value: avatar,
        },
        {
          name: "Banner",
          value: banner,
        },
      ],
    });

    const results = await readMessageResult({ messageId, processId });
    // return results;
    console.log(results);

    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getProfile = async ({ processId }: { processId: string }) => {
  try {
    const result = await dryrun({
      process: processId,
      tags: [{ name: "Action", value: "Info" }],
    });

    console.log(result);

    const message = result.Messages[0];

    if (!message) {
      throw new Error("No messages found");
    }

    if (message.Error) {
      throw new Error(message.Error);
    }

    const data: ProfileInfo = JSON.parse(message.Data);
    console.log({ data });
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const createProfileProcess = async ({ owner }: { owner: string }) => {
  const maxRetries = 5;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const processId = await spawnProcess({
        tags: [
          {
            name: "Name",
            value: PROFILE_NAME,
          },
          {
            name: "DApp-Name",
            value: "arcadia-v2",
          },
        ],
      });

      const intialized = await gql({
        variables: {
          owners: [owner],
          tags: [
            {
              name: "Data-Protocol",
              values: ["ao"],
            },
            {
              name: "Type",
              values: ["Message"],
            },
            {
              name: "Action",
              values: ["Eval"],
            },
            // remove below tag?
            {
              name: "Ctx",
              values: ["Init"],
            },
          ],
        },
      }).then((res) => res.transactions.edges.length > 0);

      if (intialized) {
        return processId;
      } else {
        await sleep(2000);

        // init
        await sendMessage({
          processId: processId,
          action: "Eval",
          data: profileProcessTemplate,
          tags: [
            {
              name: "Ctx",
              value: "Init",
            },
            {
              name: "DApp-Name",
              value: "arcadia-v2",
            },
          ],
        });

        return processId;
      }
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed: ${error}`);
      if (attempts >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
      }
      // wait for 1 sec before retrying
      await sleep(1000);
    }
  }
};

export const getProfileProcess = async (owner: string | undefined) => {
  try {
    if (!owner) {
      throw new Error("No owner address found");
    }
    // gqlNoTags is temp
    const profileProcessRes = await gqlNoTags({
      variables: {
        owners: [owner],
        tags: [
          {
            name: "Data-Protocol",
            values: ["ao"],
          },
          {
            name: "Type",
            values: ["Process"],
          },
          {
            name: "Name",
            values: [PROFILE_NAME],
          },
        ],
      },
    });

    const profileProcess = profileProcessRes.transactions.edges;

    return profileProcess;
  } catch (error) {
    console.error(error);
  }
};
