import apiClient from "./apiClient";

export async function getCommentsByPostId(postId) {
  const response = await apiClient.get(`/comments/post/${postId}`);
  return response.data.data;
}

export async function createComment(commentDetails) {
  const response = await apiClient.post("/comments/create", commentDetails);
  return response.data.data;
}

export async function likeComment(commentId) {
  const response = await apiClient.patch(`/comments/${commentId}/like`);
  return response.data.data;
}

export async function unlikeComment(commentId) {
  const response = await apiClient.patch(`/comments/${commentId}/unlike`);
  return response.data.data;
}

export async function deleteComment(commentId) {
  await apiClient.delete(`/comments/${commentId}`);
}
