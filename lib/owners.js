// Owner emails - full access, bypass maintenance
export const OWNERS = [
  "dafzfred87@gmail.com",
  "wanzzganzz095@gmail.com",
];

export function isOwner(email) {
  return OWNERS.includes(email?.toLowerCase());
}
