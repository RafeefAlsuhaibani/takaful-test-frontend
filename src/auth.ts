import api from "./api";

export async function signup(payload: {
  full_name: string; email: string; phone: string; password: string;
  national_id?: string; gender?: "male" | "female"; age?: number;
  region?: string; city?: string; education_level?: string;
  available_days?: string[]; skills?: string[]; interests?: string[];
}) {
  const { data } = await api.post("/users/auth/register/", payload);
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data.user;
}

export async function signin(email: string, password: string) {
  const { data } = await api.post("/users/auth/login/", { email, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}

export async function me() {
  const { data } = await api.get("/users/auth/me/");
  return data; // { id, email, first_name, ..., volunteer_profile }
}

export async function signout() {
  const refresh = localStorage.getItem("refresh");
  try {
    if (refresh) await api.post("/users/auth/logout/", { refresh });
  } finally {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}
