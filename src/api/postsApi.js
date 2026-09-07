import apiClient from "./apiClient";

export async function getPosts() {
  const response = await apiClient.get("/posts", {
    params: {
      sortBy: "latest",
    },
  });

  return response.data.data;
}

export async function getPostsByGroupId(groupId) {
  const response = await apiClient.get(`/posts/group/${groupId}`);
  return response.data.data;
}

export async function getPostsByAuthorId(authorId) {
  const response = await apiClient.get(`/posts/author/${authorId}`);
  return response.data.data;
}

export async function createPost(postDetails) {
  const response = await apiClient.post("/posts", postDetails);
  return response.data.data;
}

export async function deletePost(postId) {
  await apiClient.delete(`/posts/${postId}`);
}

export async function likePost(postId) {
  const response = await apiClient.patch(`/posts/${postId}/like`);
  return response.data.data;
}

export async function unlikePost(postId) {
  const response = await apiClient.patch(`/posts/${postId}/unlike`);
  return response.data.data;
}
