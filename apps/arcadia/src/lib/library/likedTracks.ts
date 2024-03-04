import { appConfig } from "@/config";
import { readMessageResult, sendMessage, spawnProcess } from "../ao";
import { dryrun } from "@permaweb/aoconnect";
import { gql } from "../helpers/gql";
import { trackProcessTemplate } from "./processes/trackTemplate";

export const saveTrack = async ({ txid }: { txid: string }) => {
  try {
    const trackProcess = await getTrackProcess();

    let processId = "";

    if (trackProcess.length > 0) {
      processId = trackProcess[0].node.id;
    } else {
      const result = await createTracksProcess();
      processId = result;
    }

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

    await new Promise((r) => setTimeout(r, 1000));
    const results = await readMessageResult({ messageId, processId });
    return results;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getLikedTracks = async () => {
  try {
    const trackProcess = await getTrackProcess();

    if (!trackProcess.length) {
      throw new Error("No track process found");
    }

    const processId = trackProcess[0].node.id;

    // const result = await sendMessage({
    //   processId,
    //   action: 'Get',
    // })
    const result = await dryrun({
      process: processId,
      tags: [{ name: "Action", value: "Get" }],
    });

    console.log(result);
    return result;
  } catch (error: any) {
    throw new Error(error);
  }
};

//  make this generic func that accepts tags and data
const createTracksProcess = async () => {
  try {
    const processId = await spawnProcess({
      tags: [
        {
          name: "Process-Type",
          value: "Playlist-Test",
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

    // init
    await sendMessage({
      processId: processId,
      action: "Eval",
      data: trackProcessTemplate,
    });

    return processId;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getTrackProcess = async () => {
  const tracksProcessRes = await gql({
    variables: {
      tags: [
        {
          name: "Data-Protocol",
          values: ["ao"],
        },
        {
          name: "Variant",
          values: ["ao.TN.1"],
        },
        {
          name: "Type",
          values: ["Process"],
        },
        {
          name: "Process-Type",
          values: ["Playlist-Test"],
        },
        {
          name: "Playlist-Type",
          values: ["Tracks"],
        },
      ],
    },
  });

  const tracksProcess = tracksProcessRes.transactions.edges;

  return tracksProcess;
};
