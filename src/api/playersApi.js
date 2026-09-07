import apiClient from "./apiClient";

export async function getPlayers(params = {}) {
  const response = await apiClient.get("/players", { params });

  return response.data.data;
}

export async function getPlayerById(playerId) {
  const response = await apiClient.get(`/players/${playerId}`);

  return response.data.data;
}
