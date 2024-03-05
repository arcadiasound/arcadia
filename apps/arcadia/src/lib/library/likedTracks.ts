import { appConfig } from "@/config";
import { readMessageResult, sendMessage, spawnProcess } from "../ao";
import { dryrun, results } from "@permaweb/aoconnect";
import { gql } from "../helpers/gql";
import { trackProcessTemplate } from "./processes/trackTemplate";
import { MessageResult } from "@/types";

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
export const createTracksProcess = async (owner: string) => {
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
  } catch (error: any) {
    throw new Error(error);
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
