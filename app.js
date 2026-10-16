(() => {
  "use strict";

  const categories = [
    { id: "mecanica", name: "Mecânica e veículos", icon: "🚗", description: "Carros, motos e manutenção", tint: "#e5efff" },
    { id: "pintura", name: "Pintura e reformas", icon: "🖌️", description: "Pintura e pequenos reparos", tint: "#fff0e3" },
    { id: "limpeza", name: "Limpeza e organização", icon: "🧽", description: "Casa, vidros e pós-obra", tint: "#e2f4ed" },
    { id: "culinaria", name: "Culinária e alimentação", icon: "🍳", description: "Cozinheiros e eventos", tint: "#fff1d9" },
    { id: "construcao", name: "Construção civil", icon: "🧱", description: "Pedreiro e reformas", tint: "#f4e9df" },
    { id: "coleta", name: "Coleta e retirada", icon: "🚚", description: "Fretes, móveis e recicláveis", tint: "#e9e9fb" },
    { id: "instalacoes", name: "Instalações e manutenção", icon: "🪛", description: "Elétrica, hidráulica e montagem", tint: "#e4f0f7" },
    { id: "jardinagem", name: "Jardinagem", icon: "🌿", description: "Jardins, grama e quintais", tint: "#e8f4df" },
    { id: "pets", name: "Passeio e cuidados com pets", icon: "🐕", description: "Passeadores e pet sitter", tint: "#f9e7ef" },
    { id: "outros", name: "Outros serviços", icon: "＋", description: "Encontre ajuda para outras tarefas", tint: "#edf0f2" }
  ];

  const STORAGE = {
    requests: "servicosPerto.requests.v1",
    profile: "servicosPerto.profile.v1",
    location: "servicosPerto.location.v1"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let activeSearch = "";

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("Não foi possível ler dados locais.", error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showToast("Não foi possível salvar neste dispositivo.");
      return false;
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function renderCategories(filter = "") {
    const normalized = filter.trim().toLocaleLowerCase("pt-BR");
    const list = categories.filter(category =>
      `${category.name} ${category.description} ${category.id}`.toLocaleLowerCase("pt-BR").includes(normalized)
    );
    const grid = $("#categoryGrid");
    grid.replaceChildren();

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "no-results";
      empty.textContent = "Não encontramos essa categoria. Tente outra busca ou solicite um serviço personalizado.";
      grid.append(empty);
    } else {
      list.forEach(category => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "category-card";
        button.dataset.category = category.id;
        button.innerHTML = `<span class="category-icon" style="--icon-bg:${category.tint}">${category.icon}</span><strong></strong><small></small>`;
        $("strong", button).textContent = category.name;
        $("small", button).textContent = category.description;
        button.addEventListener("click", () => openRequest(category.id));
        grid.append(button);
      });
    }
    $("#categoryCount").textContent = `${list.length} ${list.length === 1 ? "categoria" : "categorias"}`;
  }

  function populateCategorySelect(selectedId = "") {
    const select = $("#serviceCategory");
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione uma categoria";
    select.append(placeholder);
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = `${category.icon} ${category.name}`;
      select.append(option);
    });
    if (selectedId) select.value = selectedId;
  }

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else if (dialog) dialog.setAttribute("open", "");
  }

  function closeDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog && typeof dialog.close === "function") dialog.close();
    else if (dialog) dialog.removeAttribute("open");
  }

  function openRequest(categoryId = "") {
    $("#serviceRequestForm").reset();
    populateCategorySelect(categoryId);
    const dateInput = $('#serviceRequestForm [name="date"]');
    const now = new Date();
    dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    openDialog("serviceDialog");
  }

  let activeRequestFilter = "todos";

  function renderRequests() {
    const container = $("#requestsList");
    const allRequests = read(STORAGE.requests, []);
    const completedStates = ["Concluído", "Cancelado"];
    const requests = allRequests.filter(request => {
      const status = request.status || "Aguardando proposta";
      if (activeRequestFilter === "abertos") return !completedStates.includes(status);
      if (activeRequestFilter === "concluidos") return completedStates.includes(status);
      return true;
    });
    container.replaceChildren();

    const summary = $("#requestSummary");
    if (summary) summary.textContent = `${allRequests.length} ${allRequests.length === 1 ? "pedido salvo" : "pedidos salvos"}`;

    if (!requests.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const heading = activeRequestFilter === "concluidos" ? "Nenhum pedido concluído" :
        activeRequestFilter === "abertos" ? "Nenhum pedido em andamento" : "Seus pedidos aparecerão aqui";
      const message = allRequests.length
        ? "Não há pedidos nesta categoria de filtro."
        : "Quando solicitar um serviço, você poderá acompanhar o pedido nesta área.";
      empty.innerHTML = "<span>▤</span><strong></strong><p></p>";
      $("strong", empty).textContent = heading;
      $("p", empty).textContent = message;
      container.append(empty);
      return;
    }

    [...requests].reverse().forEach(request => {
      const category = categories.find(item => item.id === request.category);
      const card = document.createElement("article");
      card.className = "request-card";
      const symbol = document.createElement("span");
      symbol.className = "request-symbol";
      symbol.textContent = category?.icon || "🧰";

      const content = document.createElement("div");
      content.className = "request-card-content";
      const title = document.createElement("strong");
      title.textContent = request.title || "Serviço solicitado";
      const info = document.createElement("div");
      info.className = "request-meta";
      [category?.name || "Serviço", formatDate(request.date), request.period || "Período flexível", request.location].forEach(value => {
        const item = document.createElement("span");
        item.textContent = value;
        info.append(item);
      });
      content.append(title, info);

      if (request.details) {
        const details = document.createElement("p");
        details.className = "request-detail";
        details.textContent = request.details;
        content.append(details);
      }
      if (request.budget) {
        const budget = document.createElement("p");
        budget.className = "request-detail";
        budget.textContent = `Orçamento: ${request.budget}`;
        content.append(budget);
      }

      const actions = document.createElement("div");
      actions.className = "request-actions";
      const currentStatus = request.status || "Aguardando proposta";
      const status = document.createElement("span");
      status.className = "status-pill " + currentStatus.toLocaleLowerCase("pt-BR").replaceAll(" ", "-");
      status.textContent = currentStatus;

      const workflowNote = document.createElement("small");
      workflowNote.className = "request-workflow-note";
      workflowNote.textContent = request.proposals?.length
        ? `${request.proposals.length} proposta(s) registrada(s) neste dispositivo`
        : "Aguardando propostas de profissionais";
      content.append(workflowNote);

      const statusSelect = document.createElement("select");
      statusSelect.className = "status-select";
      statusSelect.setAttribute("aria-label", `Ações do pedido: ${request.title}`);
      const allowedActions = currentStatus === "Cancelado" || currentStatus === "Concluído"
        ? []
        : ["Cancelar pedido"];
      const actionPlaceholder = document.createElement("option");
      actionPlaceholder.value = "";
      actionPlaceholder.textContent = "Ações do pedido";
      statusSelect.append(actionPlaceholder);
      allowedActions.forEach(actionText => {
        const option = document.createElement("option");
        option.value = actionText;
        option.textContent = actionText;
        statusSelect.append(option);
      });
      statusSelect.addEventListener("change", () => {
        if (statusSelect.value !== "Cancelar pedido") return;
        if (!window.confirm("Deseja cancelar este pedido?")) { statusSelect.value = ""; return; }
        const current = read(STORAGE.requests, []);
        const updated = current.map(item => item.id === request.id
          ? { ...item, status: "Cancelado", updatedAt: new Date().toISOString() } : item);
        if (write(STORAGE.requests, updated)) {
          renderRequests();
          showToast("Pedido cancelado neste dispositivo.");
        }
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "request-delete";
      remove.setAttribute("aria-label", "Excluir pedido");
      remove.title = "Excluir pedido";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        if (!window.confirm("Deseja excluir este pedido salvo neste dispositivo?")) return;
        write(STORAGE.requests, read(STORAGE.requests, []).filter(item => item.id !== request.id));
        renderRequests();
        showToast("Pedido excluído.");
      });

      actions.append(statusSelect, status, remove);
      content.append(actions);
      card.append(symbol, content);
      container.append(card);
    });
  }

  function formatDate(value) {
    if (!value) return "Data flexível";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
  }

  function updateProfileUI() {
    const profile = read(STORAGE.profile, {});
    $("#profileButton").textContent = profile.name ? profile.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() : "EU";
  }

  function updateLocationUI() {
    $("#locationLabel").textContent = read(STORAGE.location, "Sua região");
  }

  $("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    activeSearch = $("#searchInput").value;
    renderCategories(activeSearch);
    $("#categoryGrid").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!activeSearch.trim()) showToast("Mostrando todas as categorias.");
  });

  $("#searchInput").addEventListener("input", event => {
    activeSearch = event.target.value;
    renderCategories(activeSearch);
  });

  $("#serviceRequestForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      category: String(form.get("category") || ""),
      title: String(form.get("title") || "").trim(),
      date: String(form.get("date") || ""),
      period: String(form.get("period") || ""),
      location: String(form.get("location") || "").trim(),
      details: String(form.get("details") || "").trim(),
      budget: String(form.get("budget") || ""),
      status: "Aguardando proposta",
      createdAt: new Date().toISOString()
    };
    if (!request.category || !request.title || !request.date || !request.period || !request.location) {
      showToast("Preencha os campos obrigatórios.");
      return;
    }
    const requestedDate = new Date(`${request.date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(requestedDate.getTime()) || requestedDate < today) {
      showToast("Escolha uma data de hoje em diante.");
      return;
    }
    if (request.location.length < 3) {
      showToast("Informe um bairro ou local mais completo.");
      return;
    }
    const requests = read(STORAGE.requests, []);
    requests.push(request);
    if (write(STORAGE.requests, requests)) {
      closeDialog("serviceDialog");
      renderRequests();
      showToast("Pedido salvo neste dispositivo. Ainda não foi enviado a profissionais.");
      $("#requestsList").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  $("#profileForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    write(STORAGE.profile, {
      name: String(form.get("name") || "").trim(),
      role: String(form.get("role") || "cliente"),
      phone: String(form.get("phone") || "").trim()
    });
    updateProfileUI();
    closeDialog("profileDialog");
    showToast("Perfil salvo neste dispositivo.");
  });

  $("#locationForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const location = String(form.get("location") || "").trim();
    if (!location) return;
    write(STORAGE.location, location);
    updateLocationUI();
    closeDialog("locationDialog");
    showToast("Região atualizada.");
  });

  $("#locationButton").addEventListener("click", () => {
    $("#locationForm").elements.location.value = read(STORAGE.location, "");
    openDialog("locationDialog");
  });

  $("#profileButton").addEventListener("click", () => {
    const profile = read(STORAGE.profile, {});
    $("#profileForm").elements.name.value = profile.name || "";
    $("#profileForm").elements.role.value = profile.role || "cliente";
    $("#profileForm").elements.phone.value = profile.phone || "";
    openDialog("profileDialog");
  });

  $("#becomeProvider").addEventListener("click", () => {
    const role = $("#profileForm").elements.role;
    role.value = "profissional";
    openDialog("profileDialog");
    showToast("Complete seu perfil para começar. O cadastro profissional online será implementado na próxima etapa.");
  });

  $$("[data-close]").forEach(button => button.addEventListener("click", () => closeDialog(button.dataset.close)));

  $$(".nav-item").forEach(button => button.addEventListener("click", () => {
    $$(".nav-item").forEach(item => item.classList.toggle("active", item === button));
    switch (button.dataset.view) {
      case "home":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "categories":
        $("#categoryGrid").scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case "request":
        openRequest();
        break;
      case "orders":
        $("#requestsList").scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case "profile":
        $("#profileButton").click();
        break;
    }
  }));

  document.addEventListener("click", event => {
    const dialog = event.target;
    if (dialog instanceof HTMLDialogElement && dialog.open && dialog === event.target && event.offsetX > dialog.clientWidth) {
      dialog.close();
    }
  });

  $$("[data-request-filter]").forEach(button => button.addEventListener("click", () => {
    activeRequestFilter = button.dataset.requestFilter;
    $$("[data-request-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderRequests();
  }));


  function populateProviderCategories() {
    const select = $("#providerCategory");
    if (!select) return;
    select.replaceChildren();
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.append(option);
    });
  }

  function renderProviderProfile() {
    const panel = $("#providerSaved");
    const provider = read("servicos-perto-provider", null);
    if (!panel) return;
    if (!provider) {
      panel.hidden = true;
      panel.replaceChildren();
      return;
    }
    panel.hidden = false;
    panel.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = provider.name;
    const category = categories.find(item => item.id === provider.category);
    const description = document.createElement("p");
    description.textContent = `${category?.name || "Serviços"} · ${provider.region || "Região não informada"}`;
    const details = document.createElement("p");
    const priceText = provider.price ? `Valor inicial: R$ ${provider.price}` : "Valor inicial não informado";
    details.textContent = `${priceText} · ${provider.available ? "Disponível para novos serviços" : "Indisponível no momento"}`;
    const status = document.createElement("span");
    status.className = "provider-badge";
    const verification = provider.verificationStatus || "Pendente de análise";
    status.textContent = verification === "Aprovado"
      ? (provider.available ? "APROVADO · DISPONIBILIDADE ATIVA" : "APROVADO · DISPONIBILIDADE PAUSADA")
      : "CADASTRO PENDENTE · NÃO RECEBE SOLICITAÇÕES";
    const reviewNote = document.createElement("p");
    reviewNote.className = "request-workflow-note";
    reviewNote.textContent = verification === "Aprovado"
      ? "Este é um estado de demonstração local; a aprovação real exige painel administrativo e backend."
      : "Seu perfil fica em análise. No protótipo, a aprovação real ainda não está conectada.";
    panel.append(reviewNote);
    panel.append(title, description, details);
    if (provider.description) {
      const about = document.createElement("p");
      about.textContent = provider.description;
      panel.append(about);
    }
    panel.append(status);
  }

  const providerForm = $("#providerForm");
  if (providerForm) {
    providerForm.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(providerForm);
      const provider = {
        name: String(data.get("name") || "").trim(),
        category: String(data.get("category") || ""),
        price: String(data.get("price") || "").trim(),
        description: String(data.get("description") || "").trim(),
        region: String(data.get("region") || "").trim(),
        available: data.get("available") === "on",
        verificationStatus: read("servicos-perto-provider", null)?.verificationStatus || "Pendente de análise",
        updatedAt: new Date().toISOString()
      };
      if (!provider.name || !provider.category) {
        showToast("Preencha o nome e a especialidade.");
        return;
      }
      if (write("servicos-perto-provider", provider)) {
        renderProviderProfile();
        showToast("Perfil salvo. Cadastro profissional pendente de análise.");
      }
    });
  }

  function loadProviderForm() {
    const provider = read("servicos-perto-provider", null);
    if (!provider || !providerForm) return;
    Object.entries(provider).forEach(([key, value]) => {
      const field = providerForm.elements.namedItem(key);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (key !== "updatedAt") field.value = value ?? "";
    });
  }

  populateProviderCategories();
  loadProviderForm();
  renderProviderProfile();

  populateCategorySelect();
  renderCategories();
  renderRequests();
  updateProfileUI();
  updateLocationUI();

  // Local prototype utilities: export user-created requests as a portable JSON backup.
  const exportButton = document.getElementById("exportRequestsButton");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const payload = {
        app: "Serviços Perto",
        version: "4.1",
        exportedAt: new Date().toISOString(),
        requests: read(STORAGE.requests, [])
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "servicos-perto-backup.json";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Backup dos pedidos exportado.");
    });
  }

  const importInput = document.getElementById("importRequestsInput");
  if (importInput) {
    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (!parsed || !Array.isArray(parsed.requests)) throw new Error("Formato inválido");
        const valid = parsed.requests.every(item => item && typeof item.id === "string" &&
          typeof item.title === "string" && typeof item.category === "string");
        if (!valid) throw new Error("Dados inválidos");
        const existing = read(STORAGE.requests, []);
        const byId = new Map(existing.map(item => [item.id, item]));
        parsed.requests.forEach(item => byId.set(item.id, item));
        if (write(STORAGE.requests, [...byId.values()])) {
          renderRequests();
          showToast("Backup importado e combinado com os pedidos existentes.");
        }
      } catch {
        showToast("Não foi possível importar: arquivo inválido.");
      } finally {
        importInput.value = "";
      }
    });
  }
})();


  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {
      console.info("Service worker indisponível neste ambiente.");
    }));
  }
