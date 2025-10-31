import api from "./index";

export async function getMyMenu() {
  const res = await api.get("/menu/my");
  return res.data.data || [];
}
