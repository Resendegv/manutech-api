const historyForm = document.getElementById("historyForm");
const historyTableBody = document.getElementById("historyTableBody");
const equipmentSelect = document.getElementById("equipamento");
const ordemSelect = document.getElementById("ordem");
const tipoManutencaoSelect = document.getElementById("tipoManutencao");
const historyEquipmentFilter = document.getElementById("historyEquipmentFilter");
const historyTypeFilter = document.getElementById("historyTypeFilter");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");
const submitHistoryBtn = document.getElementById("submitHistoryBtn");

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

async function loadEquipmentsForSelects() {
  if (!checkAuth()) return;

  try {
    const equipments = await apiRequest("/equipments/", "GET", null, true);

    equipmentSelect.innerHTML = '<option value="">Selecione um equipamento</option>';
    historyEquipmentFilter.innerHTML = '<option value="">Todos os equipamentos</option>';

    if (equipments.length === 0) {
      equipmentSelect.innerHTML = '<option value="">Nenhum equipamento cadastrado</option>';
      return;
    }

    equipments.forEach((equipment) => {
      const optionForm = document.createElement("option");
      optionForm.value = equipment.id;
      optionForm.textContent = `${equipment.id} - ${equipment.nome} (${equipment.modelo})`;
      equipmentSelect.appendChild(optionForm);

      const optionFilter = document.createElement("option");
      optionFilter.value = equipment.id;
      optionFilter.textContent = `${equipment.id} - ${equipment.nome}`;
      historyEquipmentFilter.appendChild(optionFilter);
    });
  } catch (error) {
    showMessage(error.message);
  }
}

async function loadOrdersForSelect() {
  if (!checkAuth()) return;

  try {
    const orders = await apiRequest("/work-orders/", "GET", null, true);

    ordemSelect.innerHTML = '<option value="">Sem ordem vinculada</option>';

    orders.forEach((order) => {
      const option = document.createElement("option");
      option.value = order.id;
      option.textContent = `#${order.id} - ${order.titulo}`;
      ordemSelect.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message);
  }
}

async function loadHistories() {
  if (!checkAuth()) return;

  try {
    const params = new URLSearchParams();

    if (historyEquipmentFilter.value) {
      params.append("equipamento_id", historyEquipmentFilter.value);
    }

    if (historyTypeFilter.value) {
      params.append("tipo_manutencao", historyTypeFilter.value);
    }

    const endpoint = params.toString()
      ? `/maintenance-history/?${params.toString()}`
      : "/maintenance-history/";

    const histories = await apiRequest(endpoint, "GET", null, true);

    historyTableBody.innerHTML = "";

    if (histories.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="8">Nenhum histórico cadastrado.</td>
        </tr>
      `;
      return;
    }

    histories.forEach((history) => {
      const row = document.createElement("tr");
      const dataServico = new Date(history.data_servico).toLocaleString("pt-BR");

      row.innerHTML = `
        <td>${history.id}</td>
        <td>${history.equipamento_id}</td>
        <td>${history.ordem_id ?? "-"}</td>
        <td>${history.tipo_manutencao}</td>
        <td>${history.descricao_servico}</td>
        <td>${history.observacao || ""}</td>
        <td>${dataServico}</td>
        <td>
          <button class="delete-btn" onclick="deleteHistory(${history.id})">
            Excluir
          </button>
        </td>
      `;

      historyTableBody.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message);
    handleUnauthorized(error.message);
  }
}

historyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!checkAuth()) return;

  const ordemValue = document.getElementById("ordem").value;

  const historyData = {
    descricao_servico: document.getElementById("descricaoServico").value,
    observacao: document.getElementById("observacao").value,
    tipo_manutencao: tipoManutencaoSelect.value,
    equipamento_id: Number(document.getElementById("equipamento").value),
    ordem_id: ordemValue ? Number(ordemValue) : null
  };

  submitHistoryBtn.innerText = "Salvando...";
  submitHistoryBtn.disabled = true;

  try {
    await apiRequest("/maintenance-history/", "POST", historyData, true);

    showMessage("Histórico registrado com sucesso!", false);
    historyForm.reset();
    loadHistories();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitHistoryBtn.innerText = "Registrar Histórico";
    submitHistoryBtn.disabled = false;
  }
});

async function deleteHistory(historyId) {
  if (!checkAuth()) return;

  const confirmDelete = confirm("Tem certeza que deseja excluir este histórico?");
  if (!confirmDelete) return;

  try {
    await apiRequest(`/maintenance-history/${historyId}`, "DELETE", null, true);

    showMessage("Histórico excluído com sucesso!", false);
    loadHistories();
  } catch (error) {
    showMessage(error.message);
  }
}

historyEquipmentFilter.addEventListener("change", loadHistories);
historyTypeFilter.addEventListener("change", loadHistories);

logoutBtn.addEventListener("click", () => {
  removeToken();
  redirectToLogin();
});

loadEquipmentsForSelects();
loadOrdersForSelect();
loadHistories();