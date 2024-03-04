export const trackProcessTemplate = `
local utils = require(".utils")

LikedSongs = LikedSongs or {}

local function isOwner(msg)
  return msg.From == Owner
end

Handlers.add(
  "add",
  Handlers.utils.hasMatchingTag("Action", "Add"),
  function (msg)
    if not isOwner(msg) then
      Handlers.utils.reply("Unauthorized: Only the owner can add songs.")(msg)
      return
    end

    local songTxId = msg.Data
    if not utils.includes(songTxId, LikedSongs) then
      table.insert(LikedSongs, songTxId)
    end
    Handlers.utils.reply("Song added.")(msg)
  end
)

Handlers.add(
  "remove",
  Handlers.utils.hasMatchingTag("Action", "Remove"),
  function (msg)
    if not isOwner(msg) then
      Handlers.utils.reply("Unauthorized: Only the owner can remove songs.")(msg)
      return
    end

    local songTxId = msg.Data
    LikedSongs = utils.filter(
      function (val) return val ~= songTxId end,
      LikedSongs
    )
    Handlers.utils.reply("Song removed.")(msg)
  end
)

Handlers.add(
  "get",
  Handlers.utils.hasMatchingTag("Action", "Get"),
  function (msg)
    Handlers.utils.reply(utils.map(function (songTxId) return { Data = songTxId } end, LikedSongs))(msg)
  end
)
`;
