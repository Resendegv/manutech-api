const loginForm = document.getElementById("loginForm");
const messageEl = document.getElementById("message");

function showMessage(text, isError = true) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#dc2626" : "#16a34a";
}

function extractErrorMessage(error) {
  if (!error) {
    return "Erro ao realizar login.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error.data === "string" && error.data.trim()) {
    return error.data;
  }

  if (error.data?.detail) {
    const detail = error.data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item.msg) {
            const campo = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
            return campo ? `${campo}: ${item.msg}` : item.msg;
          }
          return JSON.stringify(item);
        })
        .join(", ");
    }

    return JSON.stringify(detail);
  }

  return `Erro ao realizar login${error.status ? ` (${error.status})` : ""}.`;
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    showMessage("Preencha e-mail e senha.");
    return;
  }

  try {
    showMessage("");

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", senha);

    const data = await apiRequest("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const token =
      data?.access_token ||
      data?.token ||
      data?.accessToken ||
      null;

    if (!token) {
      showMessage("Login realizado, mas nenhum token foi retornado.");
      return;
    }

    localStorage.setItem("token", token);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Erro no login:", error);
    showMessage(extractErrorMessage(error));
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}