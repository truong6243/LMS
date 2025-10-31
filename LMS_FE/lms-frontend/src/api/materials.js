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

// Get all materials with filter
export async function getAllMaterials(status = null, skip = 0, take = 50) {
  let url = `/materials?skip=${skip}&take=${take}`;
  if (status !== null) url += `&status=${status}`;
  const res = await api.get(url);
  return res.data.data || [];
}

// Update material
export async function updateMaterial(id, data) {
  const res = await api.put(`/materials/${id}`, data);
  return res.data;
}

// Submit material for review (Draft -> Pending)
export async function submitMaterial(id) {
  const res = await api.post(`/materials/${id}/submit`);
  return res.data;
}

// Approve material (Pending -> Published)
export async function approveMaterial(id) {
  const res = await api.post(`/materials/${id}/approve`);
  return res.data;
}

// Reject material (Pending -> Draft)
export async function rejectMaterial(id, reason = '') {
  const res = await api.post(`/materials/${id}/reject`, { reason });
  return res.data;
}
