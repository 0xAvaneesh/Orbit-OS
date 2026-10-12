
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
    "  " +
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

updateClock();
setInterval(updateClock, 1000);

let topLayer = 10;

function focusWindow(win) {
  topLayer++;
  win.style.zIndex = topLayer;
}

function openApp(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.hidden = false;
  focusWindow(win);
  document.getElementById("status").textContent =
    win.dataset.title.toUpperCase();

  if (id === "terminal") {
    document.getElementById("terminal-input").focus();
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.hidden = true;
  win.classList.remove("maximized");
  win.dataset.maximized = "false";
  win.style.width = "";
  win.style.height = "";
  document.getElementById("status").textContent = "DESKTOP";
}

function minimizeWindow(id) {
  closeWindow(id);
}

function maximizeWindow(id) {
  const win = document.getElementById(id);

  if (win.dataset.maximized === "true") {
    win.classList.remove("maximized");
    win.style.cssText = win.dataset.previousStyle || "";
    win.dataset.maximized = "false";
  } else {
    win.dataset.previousStyle = win.style.cssText;
    win.classList.add("maximized");
    win.style.top = "54px";
    win.style.left = "12px";
    win.style.width = "calc(100vw - 24px)";
    win.style.height = "calc(100dvh - 95px)";
    win.style.maxHeight = "none";
    win.style.transform = "none";
    win.dataset.maximized = "true";
  }

  focusWindow(win);
}

document.querySelectorAll(".window").forEach(function(win) {
  win.addEventListener("pointerdown", function() {
    focusWindow(win);
  });

  const bar = win.querySelector(".titlebar");
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  bar.addEventListener("pointerdown", function(event) {
    if (event.target.closest("button")) return;
    if (win.dataset.maximized === "true") return;

    dragging = true;
    bar.setPointerCapture(event.pointerId);

    const rect = win.getBoundingClientRect();
    win.style.transform = "none";
    win.style.left = rect.left + "px";
    win.style.top = rect.top + "px";

    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    focusWindow(win);
  });

  bar.addEventListener("pointermove", function(event) {
    if (!dragging) return;

    const maxLeft = window.innerWidth - 80;
    const maxTop = window.innerHeight - 80;

    win.style.left = Math.max(
      0, Math.min(maxLeft, startLeft + event.clientX - startX)
    ) + "px";

    win.style.top = Math.max(
      45, Math.min(maxTop, startTop + event.clientY - startY)
    ) + "px";
  });

  function stopDragging() {
    dragging = false;
  }

  bar.addEventListener("pointerup", stopDragging);
  bar.addEventListener("pointercancel", stopDragging);
});

function calculate() {
  const input = document.getElementById("calc-input").value.trim();
  const output = document.getElementById("calc-result");

  if (!input || !/^[0-9+\-*/().%\s]+$/.test(input)) {
    output.textContent = "Enter a valid math expression.";
    return;
  }

  const tokens = input.match(/\d*\.?\d+|[+\-*/()%]/g);

  if (!tokens || tokens.join("").replace(/\s/g, "") !== input.replace(/\s/g, "")) {
    output.textContent = "Invalid expression.";
    return;
  }

  let pos = 0;

  function expression() {
    let value = term();

    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos++];
      const right = term();
      value = op === "+" ? value + right : value - right;
    }

    return value;
  }

  function term() {
    let value = factor();

    while (["*", "/", "%"].includes(tokens[pos])) {
      const op = tokens[pos++];
      const right = factor();

      if ((op === "/" || op === "%") && right === 0) {
        throw Error("Cannot divide by zero.");
      }

      if (op === "*") value *= right;
      if (op === "/") value /= right;
      if (op === "%") value %= right;
    }

    return value;
  }

  function factor() {
    if (tokens[pos] === "+") {
      pos++;
      return factor();
    }

    if (tokens[pos] === "-") {
      pos++;
      return -factor();
    }

    if (tokens[pos] === "(") {
      pos++;
      const value = expression();

      if (tokens[pos++] !== ")") throw Error("Missing closing bracket.");
      return value;
    }

    const token = tokens[pos++];

    if (!token || !/^\d*\.?\d+$/.test(token)) {
      throw Error("Invalid expression.");
    }

    return Number(token);
  }

  try {
    const result = expression();

    if (pos !== tokens.length || !Number.isFinite(result)) {
      throw Error("Invalid expression.");
    }

    output.textContent = "Answer: " + Number(result.toPrecision(12));
  } catch (error) {
    output.textContent = error.message || "Could not calculate.";
  }
}

document.getElementById("calc-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") calculate();
});

document.getElementById("browser-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const query = document.getElementById("browser-input").value.trim();
  if (!query) return;

  const url = /^https?:\/\//i.test(query)
    ? query
    : /^[\w-]+\.[a-z]{2,}(\/.*)?$/i.test(query)
      ? "https://" + query
      : "https://www.google.com/search?q=" + encodeURIComponent(query);

  window.open(url, "_blank", "noopener,noreferrer");
});

const terminalOutput = document.getElementById("terminal-output");

document.getElementById("terminal-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("terminal-input");
  const command = input.value.trim().toLowerCase();
  let result = "";

  switch (command) {
    case "help":
      result = "Commands: help, date, time, clear, home, files, notes, calc, settings, about";
      break;
    case "date":
      result = new Date().toDateString();
      break;
    case "time":
      result = new Date().toLocaleTimeString();
      break;
    case "home":
      openApp("welcome");
      result = "Welcome opened.";
      break;
    case "files":
      openApp("files");
      result = "Files opened.";
      break;
    case "notes":
      openApp("notes");
      result = "Notes opened.";
      break;
    case "calc":
      openApp("calculator");
      result = "Calculator opened.";
      break;
    case "settings":
      openApp("settings");
      result = "Settings opened.";
      break;
    case "about":
      result = "Orbit OS 1.0 | Built with HTML, CSS and JavaScript.";
      break;
    case "clear":
      terminalOutput.textContent = "";
      input.value = "";
      return;
    case "":
      return;
    default:
      result = "Command not found. Type help.";
  }

  terminalOutput.textContent += "\n\norbit > " + command + "\n" + result;
  input.value = "";
});

document.getElementById("dim-toggle").addEventListener("click", function() {
  document.body.classList.toggle("dimmed");
});

function resetDesktop() {
  document.querySelectorAll(".window").forEach(function(win) {
    win.hidden = win.id !== "welcome";
    win.style.cssText = "";
    win.classList.remove("maximized");
    win.dataset.maximized = "false";
  });

  document.body.classList.remove("dimmed");
  document.getElementById("status").textContent = "DESKTOP";
  focusWindow(document.getElementById("welcome"));
}

const notes = document.getElementById("notes-text");
const notesStatus = document.getElementById("notes-status");

try {
  notes.value = localStorage.getItem("orbit-notes") || "";
} catch {
  notesStatus.textContent = "Local saving is unavailable in this browser.";
}

notes.addEventListener("input", function() {
  try {
    localStorage.setItem("orbit-notes", notes.value);
    notesStatus.textContent = "Saved locally in this browser.";
  } catch {
    notesStatus.textContent = "Could not save notes in this browser.";
  }
});
