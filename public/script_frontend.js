const form = document.querySelector(".dialogForm");
const msgInput = document.getElementById("msgInput");
const displayDialogDiv = document.querySelector(".displayDialogDiv");

msgInput.addEventListener("input", () => {
  msgInput.style.height = "auto";
  msgInput.style.height = Math.min(msgInput.scrollHeight, 200) + "px";
});

function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function appendMessage(sender, htmlContent, sources = []) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-bubble", sender === "You" ? "user-bubble" : "ai-bubble");

  const label = document.createElement("strong");
  label.textContent = sender + ":";

  const body = document.createElement("div");
  body.classList.add("message-body");
  body.innerHTML = htmlContent;

  wrapper.appendChild(label);
  wrapper.appendChild(body);


  if (sources.length > 0) {
    const sourcesDiv = document.createElement("div");
    sourcesDiv.classList.add("sources");
    sourcesDiv.innerHTML = "<span>Sources: </span>" +
      sources.map(s =>
        `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)}</a>`
      ).join(" · ");
    wrapper.appendChild(sourcesDiv);
  }

  displayDialogDiv.appendChild(wrapper);
  displayDialogDiv.scrollTop = displayDialogDiv.scrollHeight;
}


function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("message-bubble", "ai-bubble", "typing-indicator");
  typing.id = "typingIndicator";
  typing.innerHTML = "<span></span><span></span><span></span>";
  displayDialogDiv.appendChild(typing);
  displayDialogDiv.scrollTop = displayDialogDiv.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = msgInput.value.trim();
  if (!message) return;


  appendMessage("You", escapeHTML(message));

  msgInput.value = "";
  msgInput.style.height = "auto";

  showTyping();

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    removeTyping();

    appendMessage("Daaju", marked.parse(data.reply), data.sources || []);

  } catch (error) {
    console.error("Error:", error);
    removeTyping();
    appendMessage("Daaju", `<span style="color:#e57373">Network issue hai bhai, check karo!</span>`);
  }
});
