// Giả lập API xác thực và lấy thông tin người dùng
export const mockLogin = async (credentials) => {
  console.log("Logging in with:", credentials);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    token: "mock-jwt-token-string",
    user: {
      name: "Nguyễn Văn Admin",
      department: "PHONG_HANH_CHINH",
      position: "TRUONG_PHONG",
      permissions: ["documents:upload", "documents:create"],
    },
  };
};

export const checkPermissions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    granted: true,
    checks: [
      { name: "RBAC - documents:upload", status: "Granted" },
      { name: "RBAC - documents:create", status: "Granted" },
      { name: "ABAC - Department: PHONG_HANH_CHINH", status: "Valid" },
      { name: "ABAC - Position: TRUONG_PHONG", status: "Valid" },
      { name: "ABAC - Confidentiality: INTERNAL", status: "Valid" },
    ],
  };
};