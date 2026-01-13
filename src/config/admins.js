// List of admin emails who can upload videos
export const ADMIN_EMAILS = [
  'shauryaagarwal.id@gmail.com',
];

export const isAdmin = (userEmail) => {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
};
