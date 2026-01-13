const ADMIN_EMAILS = ['shauryaagarwal.id@gmail.com'];

export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};
