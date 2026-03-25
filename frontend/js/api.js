const API_BASE_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

function removeToken() {
  localStorage.removeItem("token");
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function extractErrorMessage(data, status = null) {
  if (!data) {
    return status ? `Erro na requisição (${status}).` : "Erro na requisição.";
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data.detail) {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (item?.msg) {
            const campo = Array.isArray(item.loc)
              ? item.loc[item.loc.length - 1]
              : "";
            return campo ? `${campo}: ${item.msg}` : item.msg;
          }
          return JSON.stringify(item);
        })
        .join(", ");
    }

    return JSON.stringify(data.detail);
  }

  return status ? `Erro na requisição (${status}).` : "Erro na requisição.";
}

function handleUnauthorized(error) {
  if (!error) return false;

  const status = error.status || error?.response?.status || null;
  const message = typeof error === "string" ? error : error.message || "";

  if (status === 401 || message.toLowerCase().includes("unauthorized")) {
    removeToken();
    alert("Sua sessão expirou. Faça login novamente.");
    redirectToLogin();
    return true;
  }

  return false;
}

async function apiRequest(endpoint, methodOrOptions = "GET", body = null, auth = false, extraHeaders = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let method = "GET";
  let headers = {};
  let requestBody = null;
  let useAuth = false;

  if (typeof methodOrOptions === "object" && methodOrOptions !== null) {
    method = methodOrOptions.method || "GET";
    headers = { ...(methodOrOptions.headers || {}) };
    requestBody = methodOrOptions.body ?? null;
    useAuth = !!methodOrOptions.auth;
  } else {
    method = methodOrOptions || "GET";
    headers = { ...extraHeaders };
    requestBody = body;
    useAuth = auth;
  }

  if (useAuth) {
    const token = getToken();

    if (!token) {
      const error = new Error("Usuário não autenticado.");
      error.status = 401;
      throw error;
    }

    headers.Authorization = `Bearer ${token}`;
  }

  if (requestBody !== null && requestBody !== undefined) {
    const isFormEncoded = headers["Content-Type"] === "application/x-www-form-urlencoded";
    const isFormData = requestBody instanceof FormData;

    if (isFormData) {
      // mantém como está
    } else if (isFormEncoded) {
      requestBody =
        typeof requestBody === "string"
          ? requestBody
          : new URLSearchParams(requestBody).toString();
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      requestBody = JSON.stringify(requestBody);
    }
  }

  const config = {
    method,
    headers
  };

  if (requestBody !== null && requestBody !== undefined) {
    config.body = requestBody;
  }

  let response;

  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error("Falha de conexão com o backend.");
    error.status = 0;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(data, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}