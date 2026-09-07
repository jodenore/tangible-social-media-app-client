import apiClient from "./apiClient";

export async function uploadImage(file, folder = "posts") {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("folder", folder);

  const response = await apiClient.post("/uploads/image", formData);

  return response.data.data;
}

export async function uploadUserAvatar(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/uploads/users/avatar", formData);
  return response.data.data;
}

export async function uploadGroupAvatar(groupId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post(
    `/uploads/groups/${groupId}/avatar`,
    formData,
  );
  return response.data.data;
}

export async function uploadPlayerImage(playerSlug, file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post(
    `/uploads/players/${playerSlug}/image`,
    formData,
  );

  return response.data.data;
}

export async function uploadPlayerIcon(playerSlug, file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post(
    `/uploads/players/${playerSlug}/icon`,
    formData,
  );

  return response.data.data;
}

export async function uploadPlayerGalleryImages(
  playerSlug,
  files,
  details,
) {
  const formData = new FormData();

  files.forEach((file) => formData.append("images", file));
  formData.append("type", details.type);
  formData.append("caption", details.caption);

  const response = await apiClient.post(
    `/uploads/players/${playerSlug}/images`,
    formData,
  );

  return response.data.data;
}
