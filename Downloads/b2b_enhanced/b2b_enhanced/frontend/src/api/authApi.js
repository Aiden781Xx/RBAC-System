import api from "./axiosConfig";

export const authApi = {
  login: (userType, data) => {
    if (userType === "buyer") return api.post("/auth/buyer/login", data);
    if (userType === "supplier") return api.post("/auth/supplier/login", data);
    if (userType === "admin") return api.post("/auth/admin/login", data);
    throw new Error("Invalid userType");
  },
  register: (userType, data) => {
    if (userType === "buyer") return api.post("/auth/buyer/register", data);
    if (userType === "supplier") return api.post("/auth/supplier/register", data);
    if (userType === "admin") return api.post("/auth/admin/setup", data);
    throw new Error("Invalid userType");
  },
  googleAuth: (credential, userType) => api.post("/auth/google", { credential, userType }),
};

