import API from "./axios";

export const getMyProfile = () =>
  API.get("/users/me");

export const updateMyProfile = (profileData) =>
  API.put("/users/me", profileData);