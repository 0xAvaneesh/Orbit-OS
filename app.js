
function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
}

updateClock();
setInterval(updateClock, 1000);

let topLayer = 10;

function openApp(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.hidden = false;
  win.style.zIndex = ++topLayer;
}

function closeWindow(id) {
  document.getElementById(id).hidden = true;
}

function minimizeWindow(id) {
  document.getElementById(id).hidden = true;
}

function maximizeWindow(id) {
  const win = document.getElementById(id);

  if (win.dataset.maximized === "true") {
    win.style.width = "";
    win.style.height = "";
    win.style.top = "45%";
    win.style.left = "50%";
    win.style.transform = "translate(-50%, -50%)";
    win.dataset.maximized = "false";
  } else {
    win.style.width = "calc(100vw - 40px)";
    win.style.height = "calc(100vh - 100px)";
    win.style.top = "55px";
    win.style.left = "20px";
    win.style.transform = "none";
    win.dataset.maximized = "true";
  }

  win.style.zIndex = ++topLayer;
}

document.querySelectorAll(".window").forEach(function(win) {
  win.addEventListener("mousedown", function() {
    win.style.zIndex = ++topLayer;
  });

  const bar = win.querySelector(".titlebar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("mousedown", function(event) {
    if (event.target.tagName === "BUTTON") return;
    if (win.dataset.maximized === "true") return;

    dragging = true;

    const rect = win.getBoundingClientRect();
    win.style.transform = "none";
    win.style.left = rect.left + "px";
    win.style.top = rect.top + "px";

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    win.style.zIndex = ++topLayer;
  });

  document.addEventListener("mousemove", function(event) {
    if (!dragging) return;

    win.style.left = event.clientX - offsetX + "px";
    win.style.top = event.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", function() {
    dragging = false;
  });
});

function calculate() {
  const input = document.getElementById("calc-input").value.trim();
  const output = document.getElementById("calc-result");

  if (!/^[0-9+\-*/().%\s]+$/.test(input)) {
    output.textContent = "Enter a valid math expression.";
    return;
  }

  try {
    const result = Function('"use strict"; return (' + input + ')')();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      output.textContent = "That calculation is not valid.";
    } else {
      output.textContent = "Answer: " + result;
    }
  } catch {
    output.textContent = "Could not calculate that expression.";
  }
}

document.getElementById("calc-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") calculate();
});

function searchWeb() {
  const query = document.getElementById("browser-input").value.trim();

  if (query) {
    window.open(
      "https://www.google.com/search?q=" + encodeURIComponent(query),
      "_blank",
      "noopener"
    );
  }
}

document.getElementById("browser-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") searchWeb();
});

function runTerminal() {
  const input = document.getElementById("terminal-input");
  const output = document.getElementById("terminal-output");
  const command = input.value.trim().toLowerCase();

  if (command === "help") {
    output.textContent = "Commands: help, date, clear, home";
  } else if (command === "date") {
    output.textContent = new Date().toString();
  } else if (command === "clear") {
    output.textContent = "";
  } else if (command === "home") {
    openApp("welcome");
    output.textContent = "Welcome window opened.";
  } else {
    output.textContent = "Command not found. Type help.";
  }

  input.value = "";
}

document.getElementById("terminal-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") runTerminal();
});

function toggleBackground() {
  document.body.classList.toggle("dimmed");
}

function resetDesktop() {
  document.querySelectorAll(".window").forEach(function(win) {
    win.hidden = win.id !== "welcome";
    win.style.width = "";
    win.style.height = "";
    win.style.top = "";
    win.style.left = "";
    win.style.transform = "";
    win.dataset.maximized = "false";
  });

  document.body.classList.remove("dimmed");
}

const notes = document.getElementById("notes-text");

notes.value = localStorage.getItem("orbit-notes") || "";

notes.addEventListener("input", function() {
  localStorage.setItem("orbit-notes", notes.value);
});
