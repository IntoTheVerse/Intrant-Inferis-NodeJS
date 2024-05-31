const { Schema, model, connect } = require("mongoose");
import { userRewardType } from '../types/userRewardType';

const leaderboardDataSchema = new Schema({
  _id: Schema.Types.ObjectId,
  eventName: String,
  leaderboardAddress: String,
  data: [userRewardType],
});

export const leaderboard = model(
  "Leaderboards",
  leaderboardDataSchema,
  "WeeklyLeaderboard"
);