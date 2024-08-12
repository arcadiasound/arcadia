export const profileProcessTemplate = `
local json = require("json")
local ao = require('ao')
local utils = require(".utils")

-- Initialize or retain state
State = State or {
  Owner = Owner,
  Info = {
      name = nil,
      handle = nil,
      bio = nil,
      avatar = nil,
      banner = nil
  },
  Followers = {},
  Following = {}
}

-- Function to check if the sender is the owner
local function isOwner(Sender)
  return Sender == Owner or ao.id
end

-- Handler to update profile information
Handlers.add(
  "update",
  Handlers.utils.hasMatchingTag("Action", "Update"),
  function (msg)
    if not isOwner(msg.From) then
      ao.send({
        Target = msg.From,
        Action = 'Update-Error',
        ["Message-Id"] = msg.Id,
        Error = msg.From .. 'is not authorized to update this profile',
        Data = msg.From .. 'is not authorized to update this profile'
      })
      return
    end

    local updateInfo = json.decode(msg.Data)
    if updateInfo then
      State.Info.name = updateInfo.name or State.Info.name
      State.Info.handle = updateInfo.handle or State.Info.handle
      State.Info.bio = updateInfo.bio or State.Info.bio
      State.Info.avatar = updateInfo.avatar or State.Info.avatar
      State.Info.banner = updateInfo.banner or State.Info.banner
    end

    ao.send({
      Target = msg.From,
      Action = 'View',
      Data = json.encode(State)
    })
  end
)

-- Handler for when the current process wants to add another user to its State.Following list
Handlers.add(
"follow",
Handlers.utils.hasMatchingTag("Action", "Follow"),
function (msg)
    local Data = msg.Data
    local Sender = msg.From

    -- Handle case where user is wanting to follow another user/process
    if Sender == Owner then
      if not Data then
        ao.send({
          Target = ao.id,
          Action = 'Follow-Error',
          ["Message-Id"] = msg.Id,
          Error = "Missing target user to follow",
          Data = "Missing target user to follow"
        })
      end

      if Data == ao.id then
        ao.send({
          Target = ao.id,
          Action = 'Follow-Error',
          ["Message-Id"] = msg.Id,
          Error = "You cannot follow yourself",
          Data = "You cannot follow yourself"
        })
      end

      if utils.includes(Data, State.Following) then
        ao.send({
          Target = Sender,
          Action = 'Follow-Error',
          ["Message-Id"] = msg.Id,
          Error = "You are already following " .. Data,
          Data = "You are already following " .. Data
        })
      else
        table.insert(State.Following, Data)
  
        -- Send a message to the target user's process to add the current process as a follower
        ao.send({Target = Data, Action = "Follow"})
        Handlers.utils.reply("You are now following " .. Data)(msg)
      end
    else 
      -- If sender is not Owner, add them as a follower 
      local FollowerID = Sender
      if utils.includes(FollowerID, State.Followers) then
        ao.send({
          Target = Sender,
          Action = 'Follow-Error',
          ["Message-Id"] = msg.Id,
          Error = FollowerID .. " is already a follower",
          Data = FollowerID .. " is already a follower"
        })
      else
        table.insert(State.Followers, FollowerID)
        Handlers.utils.reply("Added follower " .. FollowerID)(msg)
      end
    end
end
)

-- Handler for when the current process wants to remove another user from its State.Following list
Handlers.add(
"unfollow",
Handlers.utils.hasMatchingTag("Action", "Unfollow"),
function (msg)
    local Data = msg.Data
    local Sender = msg.From

    -- Handle case where user is wanting to follow another user/process
    if Sender == Owner then
      if not Data then
        ao.send({
          Target = ao.id,
          Action = 'Unfollow-Error',
          ["Message-Id"] = msg.Id,
          Error = "Missing target user to unfollow",
          Data = "Missing target user to unfollow"
        })
      end

      if Data == ao.id then
        ao.send({
          Target = ao.id,
          Action = 'Follow-Error',
          ["Message-Id"] = msg.Id,
          Error = "You cannot unfollow yourself",
          Data = "You cannot unfollow yourself"
        })
      end
      
      if utils.includes(Data, State.Following) then
        State.Following = utils.filter(
          function (val) return val ~= Data end,
          State.Following
        )
    
        -- Send a message to the target user's process to remove the current process from their Followers list
        ao.send({Target = Data, Action = "Unfollow"})
        Handlers.utils.reply("You have stopped following " .. Data)(msg)
      else
        ao.send({
          Target = ao.id,
          Action = 'Unfollow-Error',
          ["Message-Id"] = msg.Id,
          Error = "You are not following " .. Data,
          Data = "You are not following " .. Data
        })
      end
    else 
      -- The process ID of the user who wants to unfollow
      local FollowerID = Sender
      if utils.includes(FollowerID, State.Followers) then
          State.Followers = utils.filter(
            function (val) return val ~= FollowerID end,
            State.Followers
          )
          Handlers.utils.reply("Removed follower " .. FollowerID)(msg)
      else
        ao.send({
          Target = Sender,
          Action = 'Unfollow-Error',
          ["Message-Id"] = msg.Id,
          Error = FollowerID .. " is not a follower",
          Data = FollowerID .. " is not a follower"
        })
      end
    end
end
)

Handlers.add(
  "info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    ao.send({
      Target = msg.From,
      Action = 'View',
      Data = json.encode(State)
    })
  end
)
`;
