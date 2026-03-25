const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

function checkAuth() {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return false;
  }
  return true;
}

function showMessage(text, isError = true) {
  if (!message) return;
  message.textContent = text || "";
  message.style.color = isError ? "red" : "green";
}

function getStatusLabel(status) {
  if (status === "aberta") return "Aberta";
  if (status === "em_andamento") return "Em andamento";
  if (status === "finalizada") return "Finalizada";
  return status || "-";
}

function getStatusClass(status) {
  if (status === "aberta") return "status-badge status-aberta";
  if (status === "em_andamento") return "status-badge status-andamento";
  if (status === "finalizada") return "status-badge status-finalizada";
  return "status-badge";
}

function renderUltimasOrdens(ordens) {
  const container = document.getElementById("ultimasOrdens");
  if (!container) return;

  container.innerHTML = "";

  if (!ordens || ordens.length === 0) {
    container.innerHTML = "<p>Nenhuma ordem recente.</p>";
    return;
  }

  ordens.forEach((ordem) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML = `
      <div>
        <strong>#${ordem.id}</strong> - ${ordem.titulo || "Sem título"}
      </div>
      <div>
        <span class="${getStatusClass(ordem.status)}">${getStatusLabel(ordem.status)}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function setDashboardValues({
  totalEquipamentos = 0,
  totalOrdens = 0,
  ordensAbertas = 0,
  ordensEmAndamento = 0,
  ordensFinalizadas = 0,
  totalHistoricos = 0
}) {
  const totalEquipamentosEl = document.getElementById("totalEquipamentos");
  const totalOrdensEl = document.getElementById("totalOrdens");
  const ordensAbertasEl = document.getElementById("ordensAbertas");
  const ordensEmAndamentoEl = document.getElementById("ordensEmAndamento");
  const ordensFinalizadasEl = document.getElementById("ordensFinalizadas");
  const totalHistoricosEl = document.getElementById("totalHistoricos");

  if (totalEquipamentosEl) totalEquipamentosEl.textContent = totalEquipamentos;
  if (totalOrdensEl) totalOrdensEl.textContent = totalOrdens;
  if (ordensAbertasEl) ordensAbertasEl.textContent = ordensAbertas;
  if (ordensEmAndamentoEl) ordensEmAndamentoEl.textContent = ordensEmAndamento;
  if (ordensFinalizadasEl) ordensFinalizadasEl.textContent = ordensFinalizadas;
  if (totalHistoricosEl) totalHistoricosEl.textContent = totalHistoricos;
}

function ordenarOrdensMaisRecentes(ordens) {
  return [...ordens].sort((a, b) => {
    const dataA = new Date(a.data_abertura || 0).getTime();
    const dataB = new Date(b.data_abertura || 0).getTime();
    return dataB - dataA;
  });
}

async function loadDashboard() {
  if (!checkAuth()) return;

  try {
    showMessage("", false);

    const [equipments, workOrders, histories] = await Promise.all([
      apiRequest("/equipments/", "GET", null, true),
      apiRequest("/work-orders/", "GET", null, true),
      apiRequest("/maintenance-history/", "GET", null, true)
    ]);

    const totalEquipamentos = Array.isArray(equipments) ? equipments.length : 0;
    const totalOrdens = Array.isArray(workOrders) ? workOrders.length : 0;
    const totalHistoricos = Array.isArray(histories) ? histories.length : 0;

    const ordensAbertas = Array.isArray(workOrders)
      ? workOrders.filter((ordem) => ordem.status === "aberta").length
      : 0;

    const ordensEmAndamento = Array.isArray(workOrders)
      ? workOrders.filter((ordem) => ordem.status === "em_andamento").length
      : 0;

    const ordensFinalizadas = Array.isArray(workOrders)
      ? workOrders.filter((ordem) => ordem.status === "finalizada").length
      : 0;

    setDashboardValues({
      totalEquipamentos,
      totalOrdens,
      ordensAbertas,
      ordensEmAndamento,
      ordensFinalizadas,
      totalHistoricos
    });

    const ultimasOrdens = Array.isArray(workOrders)
      ? ordenarOrdensMaisRecentes(workOrders).slice(0, 5)
      : [];

    renderUltimasOrdens(ultimasOrdens);
  } catch (error) {
    if (handleUnauthorized(error)) return;
    showMessage(error.message || "Erro ao carregar dashboard.");
    console.error("Erro no dashboard:", error);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    removeToken();
    redirectToLogin();
  });
}

document.addEventListener("DOMContentLoaded", loadDashboard);