import apiClient from "./apiClient";

export async function getPlayers(params = {}) {
  const response = await apiClient.get("/players", { params });

  return response.data.data;
}

export async function getPlayerById(playerId) {
  const response = await apiClient.get(`/players/${playerId}`);

  return response.data.data;
}

export async function createPlayer(player) {
  const response = await apiClient.post("/players", player);

  return response.data.data;
}

export async function updatePlayer(playerId, player) {
  const response = await apiClient.patch(`/players/${playerId}`, player);

  return response.data.data;
}

export async function deletePlayer(playerId) {
  await apiClient.delete(`/players/${playerId}`);
}
