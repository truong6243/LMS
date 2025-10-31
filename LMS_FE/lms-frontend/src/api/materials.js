import api from "./index";

// Get published materials (public)
export async function getPublishedMaterials(skip = 0, take = 20) {
  const res = await api.get(`/materials/published?skip=${skip}&take=${take}`);
  return res.data.data || [];
}

// Get materials for management (requires permission)
export async function getManagedMaterials() {
  const res = await api.get("/materials/manage");
  return res.data.data || [];
}

// Get material by ID
export async function getMaterialById(id) {
  const res = await api.get(`/materials/${id}`);
  return res.data.data;
}

// Get material by slug
export async function getMaterialBySlug(slug) {
  const res = await api.get(`/materials/by-slug/${slug}`);
  return res.data.data;
}

// Upload material
export async function uploadMaterial(data) {
  const res = await api.post("/materials/upload", data);
  return res.data;
}

// Delete material
export async function deleteMaterial(id) {
  const res = await api.delete(`/materials/${id}`);
  return res.data;
}
