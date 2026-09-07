import apiClient from "./apiClient";

export async function getGroups() {
  const response = await apiClient.get("/groups");
  return response.data.data;
}

export async function getGroupById(groupId) {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data.data;
}

export async function requestJoinGroup(groupId) {
  const response = await apiClient.patch(`/groups/${groupId}/join`);
  return response.data.data;
}
