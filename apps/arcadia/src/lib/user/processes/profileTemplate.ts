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

-- Utility function to check if a user is following another user
local function isFollowing(followee)
  return State.Following[followee] ~= nil
end

local function isFollowed(follower)
  return State.Followers[follower] ~= nil
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
    local Receiver = msg.Target
    local Sender = msg.From

    -- If the sender is the owner of the process and the Data field is missing, it's an invalid request
    if Sender == Receiver and not Data then
      ao.send({
        Target = Sender,
        Action = 'Follow-Error',
        ["Message-Id"] = msg.Id,
        Error = "Missing target user to follow",
        Data = "Missing target user to follow"
      })
      return
      end
    
    -- If the sender is not the owner of the process, add the sender as a follower
    if Sender ~= Receiver then
      local FollowerID = Sender
      if not isFollowed(FollowerID) then
          if not utils.includes(FollowerID, State.Followers) then
            table.insert(State.Followers, FollowerID)
          end
          Handlers.utils.reply("Added follower " .. FollowerID)(msg)
      else
          ao.send({
            Target = Sender,
            Action = 'Follow-Error',
            ["Message-Id"] = msg.Id,
            Error = FollowerID .. " is already a follower",
            Data = FollowerID .. " is already a follower"
          })
      end
      return -- Return early to prevent further processing
      end

    -- If the sender is the owner of the process and the Data field is present, the process is trying to follow another user
    -- Prevent following oneself
    if Receiver == Data then
      ao.send({
        Target = Sender,
        Action = 'Follow-Error',
        ["Message-Id"] = msg.Id,
        Error = "You cannot follow yourself",
        Data = "You cannot follow yourself"
      })
      return
      end
      -- Check if the current process is already following the target user
      if not isFollowing(Data) then
      if not utils.includes(Data, State.Following) then
        table.insert(State.Following, Data)
      end

      -- Send a message to the target user's process to add the current process as a follower
      ao.send({Target = Data, Action = "Follow", Data = "You are now following " .. Data})
      else
      ao.send({
        Target = Sender,
        Action = 'Follow-Error',
        ["Message-Id"] = msg.Id,
        Error = "You are already following " .. Data,
        Data = "You are already following " .. Data
      })
      end
end
)

-- Handler for when the current process wants to remove another user from its State.Following list
Handlers.add(
"unfollow",
Handlers.utils.hasMatchingTag("Action", "Unfollow"),
function (msg)
    local Data = msg.Data
    local Receiver = msg.Target
    local Sender = msg.From

    -- If the sender is the owner of the process and the Data field is missing, it's an invalid request
    if Sender == Receiver and not Data then
    ao.send({
      Target = Sender,
      Action = 'Unfollow-Error',
      ["Message-Id"] = msg.Id,
      Error = "Missing target user to unfollow",
      Data = "Missing target user to unfollow"
    })
    return
    end

    -- If the sender is not the owner of the process, remove the sender from the Followers list
    if Sender ~= Receiver then
    local FollowerID = Sender -- The process ID of the user who wants to unfollow
    if isFollowed(FollowerID) then
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
    return 
    end

    -- If the sender is the owner of the process and the Data field is present, the process is trying to unfollow another user
    -- Check if the current process is actually following the target user
    if isFollowing(Data) then
    State.Following = utils.filter(
      function (val) return val ~= Data end,
      State.Following
    )

    -- Send a message to the target user's process to remove the current process from their Followers list
    ao.send({Target = Data, Action = "Unfollow", Data = "You have stopped following " .. Data})
    else
    ao.send({
      Target = Sender,
      Action = 'Unfollow-Error',
      ["Message-Id"] = msg.Id,
      Error = "You are not following " .. Data,
      Data = "You are not following " .. Data
    })
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
