export function canViewAuthor(
  viewerRole: string | undefined,
  viewerId: string | undefined,
  authorRole: string,
  authorId: string
): boolean {
  if (viewerId && viewerId === authorId) return true;
  if (viewerRole === "ADMIN") return true;
  if (authorRole === "RESTRICTED") return false;
  if (viewerRole === "RESTRICTED") return authorRole === "ADMIN";
  return true;
}