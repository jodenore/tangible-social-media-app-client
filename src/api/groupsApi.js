import apiClient from "./apiClient";

export async function getGroups() {
  const response = await apiClient.get("/groups");
  return response.data.data;
}

export async function getGroupById(groupId) {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data.data;
}

export async function createGroup(groupDetails) {
  const response = await apiClient.post("/groups", groupDetails);
  return response.data.data;
}

export async function deleteGroup(groupId) {
  await apiClient.delete(`/groups/${groupId}`);
}

export async function requestJoinGroup(groupId) {
  const response = await apiClient.patch(`/groups/${groupId}/join`);
  return response.data.data;
}
