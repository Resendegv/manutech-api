const workOrderForm = document.getElementById("workOrderForm");
const workOrderTableBody = document.getElementById("workOrderTableBody");
const equipmentSelect = document.getElementById("equipamento");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");
const submitWorkOrderBtn = document.getElementById("submitWorkOrderBtn");
const statusFilter = document.getElementById("statusFilter");
const prioridadeFilter = document.getElementById("prioridadeFilter");

function checkAuth() {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return false;
  }
  return true;
}

function showMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? "red" : "green";
}

function getStatusLabel(status) {
  if (status === "aberta") return "Aberta";
  if (status === "em_andamento") return "Em andamento";
  if (status === "finalizada") return "Finalizada";
  return status;
}

function getStatusClass(status) {
  if (status === "aberta") return "status-badge status-aberta";
  if (status === "em_andamento") return "status-badge status-andamento";
  if (status === "finalizada") return "status-badge status-finalizada";
  return "status-badge";
}

async function loadEquipmentsForSelect() {
  if (!checkAuth()) return;

  try {
    const equipments = await apiRequest("/equipments/", "GET", null, true);

    equipmentSelect.innerHTML = '<option value="">Selecione um equipamento</option>';

    equipments.forEach((equipment) => {
      const option = document.createElement("option");
      option.value = equipment.id;
      option.textContent = `${equipment.id} - ${equipment.nome} (${equipment.modelo})`;
      equipmentSelect.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message);
  }
}

async function loadWorkOrders() {
  if (!checkAuth()) return;

  try {
    const params = new URLSearchParams();

    if (statusFilter.value) params.append("status", statusFilter.value);
    if (prioridadeFilter.value) params.append("prioridade", prioridadeFilter.value);

    const endpoint = params.toString()
      ? `/work-orders/?${params.toString()}`
      : "/work-orders/";

    const workOrders = await apiRequest(endpoint, "GET", null, true);

    workOrderTableBody.innerHTML = "";

    if (workOrders.length === 0) {
      workOrderTableBody.innerHTML = `
        <tr>
          <td colspan="8">Nenhuma ordem de serviço cadastrada.</td>
        </tr>
      `;
      return;
    }

    workOrders.forEach((order) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.titulo}</td>
        <td>${order.descricao}</td>
        <td>${order.prioridade}</td>
        <td><span class="${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span></td>
        <td>${order.equipamento_id}</td>
        <td>${order.tecnico_responsavel_id}</td>
        <td>
          <div class="actions-column">
            <button class="status-btn" onclick="updateStatus(${order.id}, 'aberta')">Aberta</button>
            <button class="status-btn status-btn-blue" onclick="updateStatus(${order.id}, 'em_andamento')">Em andamento</button>
            <button class="status-btn status-btn-green" onclick="updateStatus(${order.id}, 'finalizada')">Finalizar</button>
            <button class="delete-btn" onclick="deleteWorkOrder(${order.id})">Excluir</button>
          </div>
        </td>
      `;

      workOrderTableBody.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message);
    handleUnauthorized(error.message);
  }
}

workOrderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!checkAuth()) return;

  const workOrderData = {
    titulo: document.getElementById("titulo").value,
    descricao: document.getElementById("descricao").value,
    prioridade: document.getElementById("prioridade").value,
    equipamento_id: Number(document.getElementById("equipamento").value)
  };

  submitWorkOrderBtn.innerText = "Salvando...";
  submitWorkOrderBtn.disabled = true;

  try {
    await apiRequest("/work-orders/", "POST", workOrderData, true);

    showMessage("Ordem de serviço criada com sucesso!", false);
    workOrderForm.reset();
    loadWorkOrders();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitWorkOrderBtn.innerText = "Criar Ordem";
    submitWorkOrderBtn.disabled = false;
  }
});

async function updateStatus(workOrderId, status) {
  if (!checkAuth()) return;

  try {
    await apiRequest(
      `/work-orders/${workOrderId}/status`,
      "PATCH",
      { status },
      true
    );

    showMessage("Status atualizado com sucesso!", false);
    loadWorkOrders();
  } catch (error) {
    showMessage(error.message);
  }
}

async function deleteWorkOrder(workOrderId) {
  if (!checkAuth()) return;

  const confirmDelete = confirm("Tem certeza que deseja excluir esta ordem de serviço?");
  if (!confirmDelete) return;

  try {
    await apiRequest(`/work-orders/${workOrderId}`, "DELETE", null, true);

    showMessage("Ordem de serviço excluída com sucesso!", false);
    loadWorkOrders();
  } catch (error) {
    showMessage(error.message);
  }
}

statusFilter.addEventListener("change", loadWorkOrders);
prioridadeFilter.addEventListener("change", loadWorkOrders);

logoutBtn.addEventListener("click", () => {
  removeToken();
  redirectToLogin();
});

loadEquipmentsForSelect();
loadWorkOrders();