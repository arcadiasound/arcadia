import { sendMessage, spawnProcess } from "../ao";
import { dryrun } from "@permaweb/aoconnect";
import { gql } from "../helpers/gql";
import { trackProcessTemplate } from "./processes/trackTemplate";
import { sleep } from "@/utils";

export const saveTrack = async ({
  txid,
  processId,
  owner,
}: {
  txid: string;
  processId: string | undefined;
  owner: string | undefined;
}) => {
  if (!owner) {
    throw new Error("Owner address is required.");
  }

  if (!processId) {
    throw new Error("Process ID is required.");
  }

  try {
    const messageId = await sendMessage({
      processId,
      action: "Add",
      data: txid,
      tags: [
        {
          name: "Data-Source",
          value: txid,
        },
        {
          name: "Playlist-ID",
          value: processId,
        },
      ],
    });

    // const results = await readMessageResult({ messageId, processId });
    // return results;
    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const removeTrack = async ({
  txid,
  processId,
  owner,
}: {
  txid: string;
  processId: string | undefined;
  owner: string | undefined;
}) => {
  if (!owner) {
    throw new Error("Owner address is required.");
  }

  if (!processId) {
    throw new Error("Process ID is required.");
  }

  try {
    const messageId = await sendMessage({
      processId,
      action: "Remove",
      data: txid,
      tags: [
        {
          name: "Data-Source",
          value: txid,
        },
        {
          name: "Playlist-ID",
          value: processId,
        },
      ],
    });

    // const results = await readMessageResult({ messageId, processId });
    // return results;
    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getLikedTracksIds = async (processId: string) => {
  try {
    const result = await dryrun({
      process: processId,
      tags: [{ name: "Action", value: "Get" }],
    });

    console.log(result);

    const message = result.Messages[0];

    if (!message) {
      throw new Error("No messages found");
    }

    if (message.Error) {
      throw new Error(message.Error);
    }

    const data: string[] = JSON.parse(message.Data);
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

//  make this generic func that accepts tags and data
export const createTracksProcess = async ({ owner }: { owner: string }) => {
  const maxRetries = 5;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const processId = await spawnProcess({
        tags: [
          {
            name: "Name",
            value: "Playlist-Test1",
          },
          {
            name: "Playlist-Type",
            value: "Tracks",
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
            {
              name: "Eval-Intent",
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
          data: trackProcessTemplate,
          tags: [
            {
              name: "Eval-Intent",
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

export const getTrackProcess = async (owner: string) => {
  const tracksProcessRes = await gql({
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
          values: ["Playlist-Test1"],
        },
      ],
    },
  });

  const tracksProcess = tracksProcessRes.transactions.edges;

  return tracksProcess;
};
