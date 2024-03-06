export const trackProcessTemplate = `
local utils = require(".utils")
local json = require("json")

-- Initialize the LikedTracks table if it doesn't exist
LikedTracks = LikedTracks or {}

-- Function to check if the sender is the owner
local function isOwner(msg)
  return msg.From == Owner or ao.id
end

-- Add a song to the LikedTracks table
Handlers.add(
  "add",
  Handlers.utils.hasMatchingTag("Action", "Add"),
  function (msg)
    if not isOwner(msg) then
      ao.send({
        Target = msg.From,
        Action = 'Add-Error',
        ["Message-Id"] = msg.Id,
        Error = 'Unauthorized: ' .. msg.From .. 'is not authorized to add songs.'
      })
      return
    end

    local songTxId = msg.Data
    if not utils.includes(songTxId, LikedTracks) then
      table.insert(LikedTracks, songTxId)
    end
    Handlers.utils.reply("Song added.")(msg)
  end
)

-- Remove a song from the LikedTracks table
Handlers.add(
  "remove",
  Handlers.utils.hasMatchingTag("Action", "Remove"),
  function (msg)
    if not isOwner(msg) then
      ao.send({
        Target = msg.From,
        Action = 'Remove-Error',
        ["Message-Id"] = msg.Id,
        Error = 'Unauthorized: ' .. msg.From .. 'is not authorized to remove songs.'
      })
      return
    end

    local songTxId = msg.Data
    LikedTracks = utils.filter(
      function (val) return val ~= songTxId end,
      LikedTracks
    )
    Handlers.utils.reply("Song removed.")(msg)
  end
)

-- Get the list of liked songs
Handlers.add(
  "get",
  Handlers.utils.hasMatchingTag("Action", "Get"),
  function (msg)
    ao.send({
      Target = msg.From,
      Action = 'View',
      Data = json.encode(LikedTracks)
  })
  end
)
`;
