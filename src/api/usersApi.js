import apiClient from "./apiClient";

export async function getUserById(userId) {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data.data;
}

export async function addFavouritePlayer(userId, playerId) {
  const response = await apiClient.patch(
    `/users/${userId}/favourite-players/${playerId}`,
  );

  return response.data.data;
}

export async function removeFavouritePlayer(userId, playerId) {
  const response = await apiClient.delete(
    `/users/${userId}/favourite-players/${playerId}`,
  );

  return response.data.data;
}
