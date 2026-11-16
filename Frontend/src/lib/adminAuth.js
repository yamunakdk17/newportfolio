const TOKEN_KEY = "admin-token";

export const getAdminToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const saveAdminToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Session storage may be unavailable in restricted browser contexts. */
  }
};
