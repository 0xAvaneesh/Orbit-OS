
const clock = document.getElementById("clock");

function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleDateString() + "  " + now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => {
        const app = document.getElementById(button.dataset.open);
        app.hidden = false;
        app.style.zIndex = Date.now();
    });
});

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById(button.dataset.close).hidden = true;
    });
});

document.querySelectorAll("[data-minimize]").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById(button.dataset.minimize).hidden = true;
    });
});

document.querySelectorAll(".window").forEach(windowBox => {
    const titlebar = windowBox.querySelector(".titlebar");
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let dragging = false;

    titlebar.addEventListener("pointerdown", event => {
        if (event.target.tagName === "BUTTON") return;

        dragging = true;
        startX = event.clientX;
        startY = event.clientY;

        const rect = windowBox.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        windowBox.style.transform = "none";
        windowBox.style.left = startLeft + "px";
        windowBox.style.top = startTop + "px";
        windowBox.style.zIndex = Date.now();

        titlebar.setPointerCapture(event.pointerId);
    });

    titlebar.addEventListener("pointermove", event => {
        if (!dragging) return;

        windowBox.style.left = startLeft + event.clientX - startX + "px";
        windowBox.style.top = startTop + event.clientY - startY + "px";
    });

    titlebar.addEventListener("pointerup", () => {
        dragging = false;
    });

    titlebar.addEventListener("pointercancel", () => {
        dragging = false;
    });
});

const noteText = document.getElementById("noteText");

noteText.value = localStorage.getItem("orbitNote") || "";

noteText.addEventListener("input", () => {
    localStorage.setItem("orbitNote", noteText.value);
});

const calcDisplay = document.getElementById("calcDisplay");
const calcResult = document.getElementById("calcResult");

document.getElementById("calculate").addEventListener("click", () => {
    const expression = calcDisplay.value.trim();

    if (!/^[0-9+\-*/().\s]+$/.test(expression) || !/[0-9]/.test(expression)) {
        calcResult.textContent = "Enter a valid calculation.";
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expression + ')')();

        if (!Number.isFinite(result)) {
            calcResult.textContent = "Cannot divide by zero.";
            return;
        }

        calcResult.textContent = "= " + result;
    } catch {
        calcResult.textContent = "Invalid calculation.";
    }
});

document.getElementById("changeBackground").addEventListener("click", () => {
    const colors = ["#050608", "#101827", "#171019", "#10201b"];
    const current = document.body.style.backgroundColor;
    const index = colors.indexOf(current);
    document.body.style.backgroundColor = colors[(index + 1) % colors.length];
});
