// URL de tu Worker en Cloudflare (Solo la ruta pública, sin secrets)
const WORKER_URL = "https://carlos-portfolio-bot.<tu-subdominio>.workers.dev/chat";

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const submitBtn = document.getElementById("chat-submit-btn");
const chips = document.querySelectorAll(".chip-btn");

function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}-message`;
  
  // Renderizar saltos de línea y formateo básico de viñetas
  const formattedText = text
    .replace(/\n\*/g, "<br>•")
    .replace(/\n/g, "<br>");

  msgDiv.innerHTML = `<p style="margin:0;">${formattedText}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSendMessage(messageText) {
  const query = messageText.trim();
  if (!query) return;

  // 1. Mostrar mensaje del usuario
  appendMessage(query, "user");
  chatInput.value = "";
  chatInput.disabled = true;
  submitBtn.disabled = true;

  // 2. Indicador de carga
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message bot-message";
  loadingDiv.id = "chat-loading";
  loadingDiv.innerHTML = "<em>Consultando CV de Carlos...</em>";
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query }),
    });

    const data = await response.json();
    loadingDiv.remove();

    if (response.ok && data.answer) {
      appendMessage(data.answer, "bot");
    } else {
      appendMessage("Hubo un problema al consultar la información. Por favor, intenta de nuevo.", "bot");
    }
  } catch (error) {
    if (document.getElementById("chat-loading")) {
      document.getElementById("chat-loading").remove();
    }
    appendMessage("Error de conexión con el asistente. Inténtalo más tarde.", "bot");
  } finally {
    chatInput.disabled = false;
    submitBtn.disabled = false;
    chatInput.focus();
  }
}

// Evento al enviar formulario
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSendMessage(chatInput.value);
});

// Eventos para botones de sugerencias rápidas (chips)
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.getAttribute("data-query");
    handleSendMessage(query);
  });
});
