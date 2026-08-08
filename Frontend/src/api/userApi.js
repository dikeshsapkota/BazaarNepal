import API from "./axios";

export const getMyProfile = () =>
  API.get("/users/me");

export const updateMyProfile = (profileData) =>
  API.put("/users/me", profileData);

export const changePassword = (passwordData) =>
  API.put(
    "/users/change-password",
    passwordData
  );