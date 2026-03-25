const equipmentForm = document.getElementById("equipmentForm");
const equipmentTableBody = document.getElementById("equipmentTableBody");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
const submitEquipmentBtn = document.getElementById("submitEquipmentBtn");

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

async function loadEquipments(search = "") {
  if (!checkAuth()) return;

  try {
    const endpoint = search
      ? `/equipments/?search=${encodeURIComponent(search)}`
      : "/equipments/";

    const equipments = await apiRequest(endpoint, "GET", null, true);

    equipmentTableBody.innerHTML = "";

    if (equipments.length === 0) {
      equipmentTableBody.innerHTML = `
        <tr>
          <td colspan="7">Nenhum equipamento encontrado.</td>
        </tr>
      `;
      return;
    }

    equipments.forEach((equipment) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${equipment.id}</td>
        <td>${equipment.nome}</td>
        <td>${equipment.modelo}</td>
        <td>${equipment.numero_serie}</td>
        <td>${equipment.fabricante}</td>
        <td>${equipment.setor}</td>
        <td>
          <button class="delete-btn" onclick="deleteEquipment(${equipment.id})">
            Excluir
          </button>
        </td>
      `;

      equipmentTableBody.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message);
    handleUnauthorized(error.message);
  }
}

equipmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!checkAuth()) return;

  const equipmentData = {
    nome: document.getElementById("nome").value,
    modelo: document.getElementById("modelo").value,
    numero_serie: document.getElementById("numeroSerie").value,
    fabricante: document.getElementById("fabricante").value,
    setor: document.getElementById("setor").value
  };

  submitEquipmentBtn.innerText = "Salvando...";
  submitEquipmentBtn.disabled = true;

  try {
    await apiRequest("/equipments/", "POST", equipmentData, true);
    showMessage("Equipamento cadastrado com sucesso!", false);
    equipmentForm.reset();
    loadEquipments(searchInput.value.trim());
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitEquipmentBtn.innerText = "Cadastrar";
    submitEquipmentBtn.disabled = false;
  }
});

async function deleteEquipment(equipmentId) {
  if (!checkAuth()) return;

  const confirmDelete = confirm("Tem certeza que deseja excluir este equipamento?");
  if (!confirmDelete) return;

  try {
    await apiRequest(`/equipments/${equipmentId}`, "DELETE", null, true);
    showMessage("Equipamento excluído com sucesso!", false);
    loadEquipments(searchInput.value.trim());
  } catch (error) {
    showMessage(error.message);
  }
}

searchInput.addEventListener("input", () => {
  loadEquipments(searchInput.value.trim());
});

logoutBtn.addEventListener("click", () => {
  removeToken();
  redirectToLogin();
});

loadEquipments();