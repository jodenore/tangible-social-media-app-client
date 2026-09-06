import apiClient from "./apiClient";

export async function getPlayers() {
  const response = await apiClient.get("/players");

  return response.data.data;
}

export async function getPlayerById(playerId) {
  const response = await apiClient.get(`/players/${playerId}`);

  return response.data.data;
}
