function getId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
}

export function isAdmin(user) {
  return user?.role === "admin";
}

export function isOwner(user, owner) {
  const userId = getId(user);
  const ownerId = getId(owner);

  return Boolean(userId && ownerId && String(userId) === String(ownerId));
}

export function canManagePost(user, post) {
  return isAdmin(user) || isOwner(user, post.author);
}

export function canManageGroup(user, group) {
  return isAdmin(user) || isOwner(user, group.owner);
}
