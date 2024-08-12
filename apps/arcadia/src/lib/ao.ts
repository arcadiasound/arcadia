import { appConfig } from "@/config";
import { MessageResult, ReadResultParams, SendMessageParams, SpawnProcessParams } from "@/types";
import { spawn, message, result, createDataItemSigner } from "@permaweb/aoconnect";

const getAO = () => {
  const ao = {
    moduleTx: appConfig.ao.MODULE,
    scheduler: appConfig.ao.SCHEDULER,
    signer: createDataItemSigner(window.arweaveWallet),
  };

  return ao;
};

// Function to spawn a new following/follower process for a user
export const spawnProcess = async ({ moduleTxId, tags, scheduler }: SpawnProcessParams) => {
  const ao = getAO();
  try {
    const processId = await spawn({
      module: moduleTxId || ao.moduleTx,
      scheduler: scheduler || appConfig.ao.SCHEDULER,
      tags: tags,
      signer: ao.signer,
    });
    console.log(`Process spawned with ID: ${processId}`);
    return processId;
  } catch (error) {
    console.error("Error spawning process:", error);
    throw error;
  }
};

// Function to send a follow/unfollow message to a process
export const sendMessage = async ({ processId, action, data, tags = [] }: SendMessageParams) => {
  try {
    const ao = getAO();
    const response = await message({
      process: processId,
      tags: [{ name: "Action", value: action }, ...tags],
      signer: ao.signer,
      data: data,
    });
    console.log("Message sent:", response);
    return response;
  } catch (error: any) {
    console.error("Error sending message:", error);
    throw new Error(error);
  }
};

// Function to read the result of a message
export const readMessageResult = async ({
  messageId,
  processId,
}: ReadResultParams): Promise<MessageResult> => {
  try {
    const { Messages, Spawns, Output, Error } = await result({
      message: messageId,
      process: processId,
    });
    if (Error) {
      throw new Error("Error in message result:", Error);
    } else {
      console.log("Message result:", { Messages, Spawns, Output });
      return { Messages, Spawns, Output };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Example usage:
// Assume you have the moduleTxId for the following/follower process and a signer function

// const moduleTxId: string = 'your-module-txid';
// const signer: any = createDataItemSigner(window.arweaveWallet); // Replace 'any' with the specific signer type

// // To spawn a new process for a user
// const userProcessId = await spawnProcess({ moduleTxId, signer });

// // To send a follow message
// const followMessageResponse = await sendMessage({
//   processId: userProcessId!,
//   action: 'follow',
//   target: 'target-user-address',
//   signer: signer
// });

// // To read the result of the follow message
// const followResult = await readMessageResult({
//   messageId: followMessageResponse.id,
//   processId: userProcessId!
// });
