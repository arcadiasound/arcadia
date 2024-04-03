local json = require("json")
local ao = require('ao')

-- Initialize or retain state
Info = Info or {
  name = nil,
  handle = nil,
  bio = nil,
  avatar = nil,
  banner = nil
}

-- Ensure Handlers is properly initialized before using it
-- Assuming Handlers is defined and correctly set up somewhere in your code
Handlers.add(
  "update",
  Handlers.utils.hasMatchingTag("Action", "Update"),
  function (msg)
    local updateInfo = json.decode(msg.Data)
    if updateInfo then
      Info.name = updateInfo.name or Info.name
      Info.handle = updateInfo.handle or Info.handle
      Info.bio = updateInfo.bio or Info.bio
      Info.avatar = updateInfo.avatar or Info.avatar
      Info.banner = updateInfo.banner or Info.banner
    end

    ao.send({
      Target = msg.From,
      Action = 'View',
      Data = json.encode(Info)
    })
  end
)

Handlers.add(
  "info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    ao.send({
      Target = msg.From,
      Action = 'View',
      Data = json.encode(Info)
    })
  end
)
