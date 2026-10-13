
const $ = id => document.getElementById(id);
const windows = [...document.querySelectorAll('.window')];
let layer = 10;

function clock() {
  $('clock').textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
clock();
setInterval(clock, 1000);

function updateDock() {
  document.querySelectorAll('.dock [data-open]').forEach(button => {
    const win = $(button.dataset.open);
    button.classList.toggle('running', win && !win.hidden);
  });
}

function focusWindow(win) {
  win.style.zIndex = ++layer;
}

function openApp(id) {
  const win = $(id);
  if (!win) return;
  win.hidden = false;
  focusWindow(win);
  updateDock();
}

function closeWindow(id) {
  const win = $(id);
  if (win) win.hidden = true;
  updateDock();
}

function maximizeWindow(win) {
  if (win.dataset.maximized === 'true') {
    Object.assign(win.style, JSON.parse(win.dataset.oldStyle || '{}'));
    win.dataset.maximized = 'false';
    delete win.dataset.oldStyle;
    return;
  }

  win.dataset.oldStyle = JSON.stringify({
    left: win.style.left,
    top: win.style.top,
    width: win.style.width,
    height: win.style.height,
    transform: win.style.transform
  });

  Object.assign(win.style, {
    left: '10px',
    top: '10px',
    width: 'calc(100vw - 20px)',
    height: 'calc(100vh - 110px)',
    transform: 'none'
  });
  win.dataset.maximized = 'true';
}

document.addEventListener('click', e => {
  const opener = e.target.closest('[data-open]');
  if (opener) openApp(opener.dataset.open);

  const control = e.target.closest('[data-action]');
  if (control) {
    const win = control.closest('.window');
    if (!win) return;

    if (control.dataset.action === 'close') closeWindow(win.id);
    if (control.dataset.action === 'minimize') closeWindow(win.id);
    if (control.dataset.action === 'maximize') {
      maximizeWindow(win);
      focusWindow(win);
    }
  }
});

windows.forEach(win => {
  const bar = win.querySelector('.titlebar');
  let startX = 0, startY = 0, left = 0, top = 0, moving = false;

  win.addEventListener('pointerdown', () => focusWindow(win));

  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || win.dataset.maximized === 'true') return;

    const rect = win.getBoundingClientRect();
    const parent = $('desktop').getBoundingClientRect();

    left = rect.left - parent.left;
    top = rect.top - parent.top;
    startX = e.clientX;
    startY = e.clientY;

    Object.assign(win.style, {
      left: left + 'px',
      top: top + 'px',
      transform: 'none'
    });

    moving = true;
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener('pointermove', e => {
    if (!moving) return;

    const x = Math.max(0, Math.min(innerWidth - 70, left + e.clientX - startX));
    const y = Math.max(0, Math.min($('desktop').clientHeight - 50, top + e.clientY - startY));

    win.style.left = x + 'px';
    win.style.top = y + 'px';
  });

  const stopMoving = () => moving = false;
  bar.addEventListener('pointerup', stopMoving);
  bar.addEventListener('pointercancel', stopMoving);
});

function calculate() {
  const expression = $('calc-input').value.trim();

  if (!expression || !/^[0-9+*/().%\s-]+$/.test(expression)) {
    $('calc-result').textContent = 'Invalid expression';
    return;
  }

  try {
    const tokens = expression.match(/\d+(?:\.\d+)?|\.\d+|[()+*/%-]/g);
    if (!tokens || tokens.join('') !== expression.replace(/\s/g, '')) throw Error();

    let i = 0;

    function primary() {
      if (tokens[i] === '+' || tokens[i] === '-') {
        const sign = tokens[i++];
        return (sign === '-' ? -1 : 1) * primary();
      }

      if (tokens[i] === '(') {
        i++;
        const value = sum();
        if (tokens[i++] !== ')') throw Error();
        return value;
      }

      const token = tokens[i++];
      if (!token || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token)) throw Error();
      return Number(token);
    }

    function product() {
      let value = primary();
      while (['*', '/', '%'].includes(tokens[i])) {
        const op = tokens[i++];
        const next = primary();
        value = op === '*' ? value * next : op === '/' ? value / next : value % next;
      }
      return value;
    }

    function sum() {
      let value = product();
      while (tokens[i] === '+' || tokens[i] === '-') {
        const op = tokens[i++];
        const next = product();
        value = op === '+' ? value + next : value - next;
      }
      return value;
    }

    const result = sum();
    if (i !== tokens.length || !Number.isFinite(result)) throw Error();
    $('calc-result').textContent = String(Number(result.toPrecision(12)));
  } catch {
    $('calc-result').textContent = 'Invalid expression';
  }
}

$('calc-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') calculate();
});

document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.key;
    const input = $('calc-input');

    if (key === 'C') {
      input.value = '';
      $('calc-result').textContent = '0';
    } else if (key === 'Back') {
      input.value = input.value.slice(0, -1);
    } else if (key === '=') {
      calculate();
      return;
    } else {
      input.value += key;
    }

    input.focus();
  });
});

const files = {
  Home: {
    Documents: 'folder',
    Projects: 'folder',
    Pictures: 'folder',
    'Read me.txt': 'Welcome to Orbit OS!\nOpen folders to explore sample files.'
  },
  Documents: {
    'About.txt': 'Orbit OS is a small browser-based desktop.',
    'Ideas.txt': 'Build useful apps.\nKeep the interface simple.'
  },
  Projects: {
    'Orbit OS.txt': 'A web desktop built with HTML, CSS and JavaScript.',
    'OrbitLab.txt': 'A 3D solar system explorer.'
  },
  Pictures: {
    'Info.txt': 'This demo cannot access pictures on your computer.'
  }
};

let folder = 'Home';

function showFiles() {
  $('file-path').textContent = 'Home' + (folder === 'Home' ? '' : ' / ' + folder);
  $('file-back').disabled = folder === 'Home';
  $('file-preview').hidden = true;
  $('file-list').replaceChildren();

  Object.entries(files[folder]).forEach(([name, value]) => {
    const button = document.createElement('button');
    button.textContent = (value === 'folder' ? '▰  ' : '▤  ') + name;

    button.addEventListener('click', () => {
      if (value === 'folder') {
        folder = name;
        showFiles();
      } else {
        $('file-preview').textContent = value;
        $('file-preview').hidden = false;
      }
    });

    $('file-list').append(button);
  });
}

$('file-back').addEventListener('click', () => {
  folder = 'Home';
  showFiles();
});
showFiles();

const history = [];
let historyIndex = 0;

function runTerminal() {
  const input = $('terminal-input');
  const command = input.value.trim();
  if (!command) return;

  history.push(command);
  historyIndex = history.length;

  const [name, ...args] = command.split(/\s+/);
  let result = '';

  if (name === 'help') {
    result = 'help, date, time, clear, echo, ls, open, whoami, version';
  } else if (name === 'date') {
    result = new Date().toDateString();
  } else if (name === 'time') {
    result = new Date().toLocaleTimeString();
  } else if (name === 'echo') {
    result = args.join(' ');
  } else if (name === 'ls') {
    result = 'Documents  Projects  Pictures  Read me.txt';
  } else if (name === 'whoami') {
    result = 'orbit';
  } else if (name === 'version') {
    result = 'Orbit OS 2.1';
  } else if (name === 'open') {
    const app = args[0]?.toLowerCase();
    if (app && $(app)?.classList.contains('window')) {
      openApp(app);
      result = 'Opened ' + app;
    } else {
      result = 'Usage: open files|notes|calculator|browser|terminal|settings';
    }
  } else if (name !== 'clear') {
    result = 'Command not found. Type help.';
  }

  const output = $('terminal-output');
  output.textContent = name === 'clear'
    ? ''
    : output.textContent + '\n\n$ ' + command + (result ? '\n' + result : '');

  output.scrollTop = output.scrollHeight;
  input.value = '';
}

$('terminal-form').addEventListener('submit', e => {
  e.preventDefault();
  runTerminal();
});

$('terminal-input').addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    historyIndex = Math.max(0, Math.min(
      history.length,
      historyIndex + (e.key === 'ArrowUp' ? -1 : 1)
    ));
    e.target.value = history[historyIndex] || '';
  }
});

$('browser-form').addEventListener('submit', e => {
  e.preventDefault();
  const value = $('browser-input').value.trim();
  if (!value) return;

  let url;
  if (/^https?:\/\//i.test(value)) {
    url = value;
  } else if (/^[\w-]+(?:\.[\w-]+)+(?:\/\S*)?$/.test(value)) {
    url = 'https://' + value;
  } else {
    url = 'https://www.google.com/search?q=' + encodeURIComponent(value);
  }

  window.open(url, '_blank', 'noopener,noreferrer');
});

for (const id of ['notes-title', 'notes-text']) {
  try {
    $(id).value = localStorage.getItem('orbit-' + id) || '';
  } catch {}

  $(id).addEventListener('input', () => {
    try {
      localStorage.setItem('orbit-' + id, $(id).value);
      $('notes-status').textContent = 'Saved on this device';
    } catch {
      $('notes-status').textContent = 'Storage unavailable';
    }
  });
}

function setDim(value) {
  const amount = Math.max(0, Math.min(90, Number(value) || 0));
  document.body.style.setProperty('--dim', amount / 100);
  $('dim-value').textContent = amount + '%';
  $('dim-range').value = amount;
}

let savedDim = 35;
try {
  savedDim = localStorage.getItem('orbit-dim') ?? 35;
} catch {}
setDim(savedDim);

$('dim-range').addEventListener('input', e => {
  setDim(e.target.value);
  try {
    localStorage.setItem('orbit-dim', e.target.value);
  } catch {}
});

$('reset-desktop').addEventListener('click', () => {
  windows.forEach(win => {
    win.hidden = win.id !== 'welcome';

    for (const key of ['left', 'top', 'width', 'height', 'transform', 'zIndex']) {
      win.style[key] = '';
    }

    win.dataset.maximized = 'false';
    delete win.dataset.oldStyle;
  });

  layer = 10;
  updateDock();
});

updateDock();