const { Schema, model, connect } = require("mongoose");
const userRewardType = require("./types/userRewardType");

const leaderboardDataSchema = new Schema({
  _id: Schema.Types.ObjectId,
  eventName: String,
  leaderboardAddress: String,
  data: [userRewardType],
});

export const player = model(
  "Leaderboards",
  leaderboardDataSchema,
  "WeeklyLeaderboard"
);