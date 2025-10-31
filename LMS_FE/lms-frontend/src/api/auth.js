import api, { setAccessToken, setRefreshToken } from "./index";

export async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });
  setAccessToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
  return res.data.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore logout errors
  }
  setAccessToken(null);
  setRefreshToken(null);
}
