// ===== VARIÁVEIS GLOBAIS =====
let products = [];
let chartInstance = null;
let currentTab = 0;
const tabs = ['perfil', 'comportamento', 'conversa-ativacao'];

// ===== BACKEND URL =====
// A API base será relativa ao domínio atual, permitindo que o front-end se comunique
// com o back-end hospedado sob o mesmo domínio/porta. Ao testar localmente com
// por exemplo http://localhost:8000, as requisições serão feitas corretamente.
const API_BASE = '';

// ===== DADOS DINÂMICOS =====
// Os dados de leads, conversas, vendas etc. serão carregados por funções que
// consultam o back‑end. Inicialmente definimos um objeto vazio que será
// preenchido quando os dados forem buscados.
const dynamicData = {
  leads: [],
  conversations: [],
  sales: [],
  satisfaction: []
};

// ===== SEÇÕES =====
function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => { section.style.display = 'none'; });
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.style.display = 'block';
  const navLinks = document.querySelectorAll('.nav-sidebar .nav-link');
  navLinks.forEach(link => { link.classList.remove('active'); });
  const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
  if (activeLink) activeLink.classList.add('active');
  if (sectionId === 'analysis') setTimeout(createPerformanceChart, 100);
}

// ===== ABAS =====
function nextTab() { if (currentTab < tabs.length - 1) { currentTab++; navigateToTab(tabs[currentTab]); } }
function previousTab() { if (currentTab > 0) { currentTab--; navigateToTab(tabs[currentTab]); } }
function navigateToTab(tabId) {
  currentTab = tabs.indexOf(tabId);
  document.querySelectorAll('.nav-tabs .nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show','active'));
  const targetTab = document.getElementById(`${tabId}-tab`);
  const targetPane = document.getElementById(tabId);
  if (targetTab && targetPane) { targetTab.classList.add('active'); targetPane.classList.add('show','active'); }
  updateNavigationButtons();
}
function updateNavigationButtons() {
  const prevButtons = document.querySelectorAll('[onclick="previousTab()"]');
  const nextButtons = document.querySelectorAll('[onclick="nextTab()"]');
  prevButtons.forEach(btn => { btn.disabled = currentTab === 0; });
  nextButtons.forEach(btn => { btn.style.display = currentTab === tabs.length - 1 ? 'none' : 'inline-flex'; });
}

// ===== AUTENTICAÇÃO E CARREGAMENTO DE DADOS =====
/**
 * Verifica se há um token armazenado. Caso não exista, redireciona para a página de login.
 */
function verifyAuthentication() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // se não estamos na página de login/cadastro, redirecionar
    if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('signup.html')) {
      window.location.href = 'login.html';
    }
  }
}

/**
 * Busca a lista de leads do back‑end e armazena em dynamicData.leads.
 */
async function fetchLeads() {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/api/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      dynamicData.leads = Array.isArray(data) ? data : [];
      updateLeadsCard();
    }
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
  }
}

/**
 * Busca o resumo de leads (quantidade por classificação) do back‑end.
 */
async function fetchLeadsSummary() {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/api/leads/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const summary = await response.json();
      updateLeadsSummaryMetrics(summary);
    }
  } catch (err) {
    console.error('Erro ao buscar resumo de leads:', err);
  }
}

/**
 * Atualiza o cartão de leads com a quantidade atual.
 */
function updateLeadsCard() {
  const leadsCard = document.getElementById('leads-card');
  if (leadsCard) {
    const numberEl = leadsCard.querySelector('.metric-number');
    if (numberEl) numberEl.textContent = dynamicData.leads.length;
  }
}

/**
 * Atualiza os elementos de métricas de leads na página de análise com base no resumo recebido.
 * Espera-se que summary seja um objeto contendo as chaves: lead, lead_qualificado,
 * lead_quente, prospectivo_cliente, cliente.
 */
function updateLeadsSummaryMetrics(summary) {
  if (!summary) return;
  // Exemplo: atualizar um gráfico de pizza e os contadores no modal. Para simplicidade,
  // apenas atualizamos a variável dynamicData.leads mais tarde.
  // Este ponto pode ser estendido para atualizar gráficos específicos.
  // Exemplo de uso: se o seu HTML possui elementos com ids específicos para cada categoria,
  // você pode fazer:
  // document.getElementById('count-lead').textContent = summary.lead;
  // etc.
}

/**
 * Função de inicialização a ser executada ao carregar a página.
 */
async function initDashboard() {
  verifyAuthentication();
  await fetchLeads();
  await fetchLeadsSummary();
  // Outras chamadas de dados (conversas, vendas, satisfação) podem ser adicionadas aqui
  // quando os respectivos endpoints existirem.
}

// Executa initDashboard ao carregar a página principal (index.html)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// ===== COMPORTAMENTO =====
function toggleWhatsAppConfig() {
  const checkbox = document.getElementById('whatsapp-notification');
  const config = document.getElementById('whatsapp-config');
  if (checkbox && config) config.style.display = checkbox.checked ? 'block' : 'none';
}
function toggleSiteLinkConfig() {
  const checkbox = document.getElementById('site-link');
  const config = document.getElementById('site-link-config');
  if (checkbox && config) config.style.display = checkbox.checked ? 'block' : 'none';
}
function toggleProductLinkConfig() {
  const checkbox = document.getElementById('product-link');
  const config = document.getElementById('product-link-config');
  if (checkbox && config) config.style.display = checkbox.checked ? 'block' : 'none';
}

// ===== PERFIL =====
function saveProfile() {
  const modal = new bootstrap.Modal(document.getElementById('successModal'));
  modal.show();
}

// ===== MODAIS =====
function openMetricModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    populateModalTable(modalId);
  }
}
function closeMetricModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}
function populateModalTable(modalId, categoryFilter = 'all') {
  let data, tableBodyId, renderFunction;
  switch (modalId) {
    case 'conversations-modal':
      // Conversas ainda não são carregadas do back‑end; usar dynamicData.conversations
      data = dynamicData.conversations;
      tableBodyId = 'conversations-table-body';
      renderFunction = (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.date}</td>
          <td>${item.lastMessage}</td>
          <td><span class="badge badge-${item.status === 'Aberta' ? 'success' : 'secondary'}">${item.status}</span></td>
        </tr>`;
      break;
    case 'leads-modal':
      data = dynamicData.leads;
      tableBodyId = 'leads-table-body';
      let filteredLeads = categoryFilter === 'all' ? data : data.filter(lead => (lead.classification || lead.category) === categoryFilter);
      renderFunction = (item) => {
        // item.classification corresponde aos valores retornados pelo back‑end (Lead, Lead Qualificado, Lead Quente, Prospectivos Clientes, Cliente)
        const category = item.classification || item.category || 'Lead';
        let badgeClass = 'badge-secondary';
        switch (category) {
          case 'Lead': badgeClass = 'badge-lead'; break;
          case 'Lead Qualificado': badgeClass = 'badge-lead-qualificado'; break;
          case 'Lead Quente': badgeClass = 'badge-lead-quente'; break;
          case 'Prospectivo Cliente':
          case 'Prospectivos Clientes': badgeClass = 'badge-prospectivos'; break;
          case 'Cliente': badgeClass = 'badge-cliente'; break;
        }
        return `
          <tr>
            <td>${item.name || 'Sem Nome'}</td>
            <td>${item.phone || ''}</td>
            <td>${item.last_message_date || item.lastMessageDate || ''}</td>
            <td><span class="badge ${badgeClass}">${category}</span></td>
          </tr>`;
      };
      data = filteredLeads;
      break;
    case 'sales-modal':
      data = dynamicData.sales;
      tableBodyId = 'sales-table-body';
      renderFunction = (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.product}</td>
          <td>R$ ${Number(item.value).toFixed(2)}</td>
          <td>${item.date}</td>
        </tr>`;
      break;
    case 'satisfaction-modal':
      data = dynamicData.satisfaction;
      tableBodyId = 'satisfaction-table-body';
      renderFunction = (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${'⭐'.repeat(item.rating)}</td>
          <td>${item.comment}</td>
          <td>${item.date}</td>
        </tr>`;
      break;
    default: return;
  }
  const tableBody = document.getElementById(tableBodyId);
  if (tableBody) tableBody.innerHTML = data.map(renderFunction).join('');
}
function filterTable(modalId, searchTerm) {
  const tableBodyId = modalId.replace('-modal', '-table-body');
  const tableBody = document.getElementById(tableBodyId);
  if (!tableBody) return;
  const rows = tableBody.getElementsByTagName('tr');
  const filter = searchTerm.toUpperCase();
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    let found = false;
    for (let j = 0; j < cells.length; j++) {
      const cellText = cells[j].textContent || cells[j].innerText;
      if (cellText.toUpperCase().indexOf(filter) > -1) { found = true; break; }
    }
    rows[i].style.display = found ? '' : 'none';
  }
}

// ===== PRODUTOS =====
function addProduct() {
  const form = document.getElementById("product-form");
  const imgFile = form.querySelector("#product-image").files[0];
  const name = form.querySelector("#product-name").value.trim();
  const price = parseFloat(form.querySelector("#product-price").value);
  const category = form.querySelector("#product-category").value;
  const description = form.querySelector("#product-description").value.trim();

  if (!name) { showNotification("Por favor, insira o nome do produto.", "warning"); return; }
  if (!price || price <= 0) { showNotification("Por favor, insira um preço válido.", "warning"); return; }
  if (!description) { showNotification("Por favor, descreva o produto.", "warning"); return; }

  const product = {
    id: Date.now(), name, price,
    category: category || "Sem categoria",
    description, image: imgFile ? URL.createObjectURL(imgFile) : null
  };

  products.push(product);
  updateProductTable();
  form.reset();
  showNotification("Produto adicionado com sucesso!", "success");
}
function updateProductTable() {
  const tbody = document.getElementById("product-list");
  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="fas fa-box-open fa-2x mb-2"></i><br>
          Nenhum produto cadastrado ainda
        </td>
      </tr>`;
    return;
  }
  tbody.innerHTML = products.map(product => `
    <tr>
      <td>
        ${product.image ?
          `<img src="${product.image}" alt="${product.name}" class="product-image">` :
          `<div class="product-placeholder"><i class="fas fa-image"></i></div>`
        }
      </td>
      <td>
        <strong>${product.name}</strong><br>
        <small class="text-muted">${product.description}</small>
      </td>
      <td><span class="badge badge-primary">${product.category}</span></td>
      <td><span class="price-tag">R$ ${product.price.toFixed(2)}</span></td>
      <td><span class="badge badge-success">Ativo</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" title="Editar produto"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${product.id})" title="Remover produto"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}
function removeProduct(productId) {
  if (confirm("Tem certeza que deseja remover este produto?")) {
    products = products.filter(product => product.id !== productId);
    updateProductTable();
    showNotification("Produto removido com sucesso!", "info");
  }
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement("div");
  notification.className = `notification alert alert-${type} alert-dismissible fade show`;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas fa-${getNotificationIcon(type)} mr-2"></i>
      <span>${message}</span>
      <button type="button" class="close ml-auto" onclick="this.parentElement.parentElement.remove()">
        <span>&times;</span>
      </button>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => { if (notification.parentElement) notification.remove(); }, 5000);
}
function getNotificationIcon(type) {
  const icons = { success: "check-circle", warning: "exclamation-triangle", danger: "exclamation-circle", info: "info-circle" };
  return icons[type] || "info-circle";
}

// ===== GRÁFICO =====
function createPerformanceChart() {
  const ctx = document.getElementById("performanceChart");
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5", "Semana 6"],
      datasets: [
        { label: "Conversões", data: [12, 19, 8, 15, 22, 18],
          borderColor: "#007bff", backgroundColor: "rgba(0, 123, 255, 0.1)", borderWidth: 3,
          fill: true, tension: 0.4, pointBackgroundColor: "#007bff", pointBorderColor: "#ffffff",
          pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8 },
        { label: "Leads", data: [8, 12, 15, 10, 18, 14],
          borderColor: "#28a745", backgroundColor: "rgba(40, 167, 69, 0.1)", borderWidth: 3,
          fill: true, tension: 0.4, pointBackgroundColor: "#28a745", pointBorderColor: "#ffffff",
          pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { usePointStyle: true, padding: 20, font: { family: "Inter", size: 12 }, color: "#ffffff" } },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)", titleColor: "#ffffff", bodyColor: "#ffffff",
          borderColor: "#007bff", borderWidth: 1, cornerRadius: 8, displayColors: true, intersect: false, mode: "index"
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 11 }, color: "#a0a0a0" } },
        y: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { font: { family: "Inter", size: 11 }, color: "#a0a0a0" } }
      },
      interaction: { intersect: false, mode: "index" },
      elements: { point: { hoverBackgroundColor: "#ffffff" } }
    }
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  loadAgentConfig();
  updateNavigationButtons();
  document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-bs-target').replace('#', '');
      navigateToTab(targetId);
    });
  });
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) closeMetricModal(e.target.id);
  });
  if (document.getElementById('analysis').style.display !== 'none') createPerformanceChart();
  console.log('Sistema Helsen IA inicializado com sucesso!');
});

// ===== FORM AGENTE =====
function validateAgentForm() {
  const form = document.getElementById("agent-config-form");
  const name = form.querySelector("#agent-name").value.trim();
  if (!name) { showNotification("Por favor, insira o nome do agente.", "warning"); return false; }
  return true;
}
function saveAgentConfig() {
  if (!validateAgentForm()) return;
  const form = document.getElementById("agent-config-form");
  const config = {
    name: form.querySelector("#agent-name").value.trim(),
    communicationStyle: form.querySelector("#communication-style").value,
    sector: form.querySelector("#agent-sector").value,
    profileType: form.querySelector("#agent-profile-type").value,
    profileCustom: form.querySelector("#agent-profile-custom").value.trim()
  };
  localStorage.setItem("agentConfig", JSON.stringify(config));
  showNotification("Configurações salvas com sucesso!", "success");
}
function loadAgentConfig() {
  const savedConfig = localStorage.getItem("agentConfig");
  if (!savedConfig) return;
  try {
    const config = JSON.parse(savedConfig);
    const form = document.getElementById("agent-config-form");
    if (form) {
      form.querySelector("#agent-name").value = config.name || "";
      form.querySelector("#communication-style").value = config.communicationStyle || "";
      form.querySelector("#agent-sector").value = config.sector || "";
      form.querySelector("#agent-profile-type").value = config.profileType || "";
      form.querySelector("#agent-profile-custom").value = config.profileCustom || "";
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

// ===== CHATBOT =====
class Chatbot {
  constructor() {
    this.webhookUrl = BACKEND_BASE + '/api/chat';
    this.isOpen = false;
    this.isTyping = false;
    this.sessionId = this.generateSessionId();
    this.pendingImageFile = null;

    // memória volátil
    this.history = [];
    this.maxHistory = 20;

    this.init();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  bindOnce(el, evt, handler) {
    if (!el || !evt || !handler) return;
    const key = `__bound_${evt}`;
    if (el.dataset && el.dataset[key]) return;
    el.addEventListener(evt, handler);
    if (el.dataset) el.dataset[key] = '1';
  }

  init() {
    this.bindEvents();
    this.addInitialMessage();
    this.ensureAttachmentControls();
  }

  ensureAttachmentControls() {
    const container = document.querySelector('.chatbot-input-container');
    if (!container) return;

    let imgBtn = document.getElementById('chatbot-image-btn');
    let imgInput = document.getElementById('chatbot-image-input');
    let preview = document.getElementById('chatbot-attachment-preview');

    if (!imgBtn) {
      imgBtn = document.createElement('button');
      imgBtn.id = 'chatbot-image-btn';
      imgBtn.type = 'button';
      imgBtn.className = 'chatbot-send-btn';
      imgBtn.innerHTML = '<i class="fas fa-image"></i>';
      container.insertBefore(imgBtn, container.firstChild);
    }
    if (!imgInput) {
      imgInput = document.createElement('input');
      imgInput.type = 'file';
      imgInput.id = 'chatbot-image-input';
      imgInput.accept = 'image/*';
      imgInput.style.display = 'none';
      container.appendChild(imgInput);
    }
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'chatbot-attachment-preview';
      preview.style.cssText = 'position:absolute; bottom:68px; right:20px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:8px 10px; display:none; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,.25);';
      preview.innerHTML = '<span style="font-size:.85rem;color:#ddd">Imagem anexada</span> <button type="button" id="chatbot-attachment-remove" class="btn btn-sm btn-outline-secondary" style="padding:.15rem .4rem;">remover</button>';
      const win = document.getElementById('chatbot-window');
      if (win) { win.style.position = 'relative'; win.appendChild(preview); }
    }

    this.bindOnce(imgBtn, 'click', () => imgInput.click());
    this.bindOnce(imgInput, 'change', () => {
      const file = imgInput.files && imgInput.files[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        this.addMessage('Arquivo inválido. Selecione uma imagem.', 'bot');
        imgInput.value = '';
        return;
      }
      this.pendingImageFile = file;
      this.showAttachmentPreview();
      this.addImageBubble(URL.createObjectURL(file), 'user');
      imgInput.value = '';
    });
    const removeBtn = document.getElementById('chatbot-attachment-remove');
    this.bindOnce(removeBtn, 'click', () => {
      this.pendingImageFile = null;
      this.hideAttachmentPreview();
    });
  }

  showAttachmentPreview() {
    const el = document.getElementById('chatbot-attachment-preview');
    if (el) el.style.display = 'flex';
  }
  hideAttachmentPreview() {
    const el = document.getElementById('chatbot-attachment-preview');
    if (el) el.style.display = 'none';
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    this.bindOnce(toggle, 'click', () => this.toggleChat());
    this.bindOnce(close, 'click', () => this.closeChat());
    this.bindOnce(input, 'keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.bindOnce(sendBtn, 'click', () => this.sendMessage());
  }

  toggleChat() {
    const windowEl = document.getElementById('chatbot-window');
    const container = document.querySelector('.chatbot-container');
    if (!windowEl) return;
    if (this.isOpen) {
      windowEl.classList.remove('show');
      this.isOpen = false;
      if (container) container.classList.remove('open');
    } else {
      windowEl.classList.add('show');
      this.isOpen = true;
      if (container) container.classList.add('open');
      setTimeout(() => {
        const input = document.getElementById('chatbot-input');
        if (input) input.focus();
      }, 300);
    }
  }
  openChat(){ if (!this.isOpen) this.toggleChat(); }
  closeChat(){ if (this.isOpen) this.toggleChat(); }

  addInitialMessage(){ /* opcional */ }

  _pushHistory(role, content){
    this.history.push({ role, content, ts: Date.now() });
    if (this.history.length > this.maxHistory) this.history = this.history.slice(-this.maxHistory);
  }
  clearMemory(){ this.history = []; showNotification('Memória do chat limpa.','info'); }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const raw = input.value || '';
    const message = raw.trim();
    if (this.isTyping) return;

    const hasPendingImage = !!this.pendingImageFile;
    if (!message && !hasPendingImage) return;

    // ecoa e limpa IMEDIATAMENTE
    if (message) {
      this.addMessage(message, 'user');
      this._pushHistory('user', message);
    }
    input.value = '';
    input.blur();

    this.showTypingIndicator();

    try {
      if (hasPendingImage) {
        // esconde preview e solta o arquivo ANTES da requisição (some na hora)
        const fileToSend = this.pendingImageFile;
        this.pendingImageFile = null;
        this.hideAttachmentPreview();

        await this.sendImageFile(fileToSend, message || 'Analise a imagem de forma objetiva.');
      } else {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: this.sessionId,
            history: this.history.slice(-this.maxHistory),
            timestamp: new Date().toISOString()
          })
        });
        if (!response.ok) throw new Error('Erro na resposta do servidor');
        const data = await response.json();
        this.hideTypingIndicator();
        this.addMessage(data.output, 'bot');
        this._pushHistory('assistant', data.output || '');
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      this.hideTypingIndicator();
      this.addMessage('Desculpe, ocorreu um erro. Tente novamente em alguns instantes.', 'bot');
      this._pushHistory('assistant', '[erro]');
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${this.escapeHtml(text)}</p>
      </div>
      <div class="message-time">${timeString}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addImageBubble(src, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;
    const wrap = document.createElement('div');
    wrap.className = `message ${sender}-message`;
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    wrap.innerHTML = `
      <div class="message-content">
        <img src="${src}" alt="Imagem" style="max-width:220px; border-radius:8px; display:block;">
      </div>
      <div class="message-time">${timeString}</div>
    `;
    messagesContainer.appendChild(wrap);
    this.scrollToBottom();
  }

  async sendImageFile(file, prompt = 'Analise a imagem de forma objetiva.') {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file, file.name || 'image.png');
      fd.append('prompt', prompt);
      fd.append('sessionId', this.sessionId);
      fd.append('history', JSON.stringify(this.history.slice(-this.maxHistory)));

      const resp = await fetch(VISION_UPLOAD_URL, { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();

      this.hideTypingIndicator();

      if (data.image_url) this.addImageBubble(data.image_url, 'bot');
      if (data.output) {
        this.addMessage(data.output, 'bot');
        this._pushHistory('assistant', data.output);
      } else {
        this.addMessage('Imagem recebida.', 'bot');
        this._pushHistory('assistant', 'Imagem recebida.');
      }
    } catch (e) {
      console.error(e);
      this.hideTypingIndicator();
      this.addMessage('Erro ao analisar a imagem.', 'bot');
      this._pushHistory('assistant', '[erro imagem]');
    }
  }

  showTypingIndicator() {
    if (this.isTyping) return;
    this.isTyping = true;
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();

    const sendBtn = document.getElementById('chatbot-send');
    if (sendBtn) sendBtn.disabled = true;
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();

    const sendBtn = document.getElementById('chatbot-send');
    if (sendBtn) sendBtn.disabled = false;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  updateProductTable();
  updateNavigationButtons();
  window.chatbot = new Chatbot();
});
