// DOM Elements
const ipInput = document.getElementById('ipAddress');
const portInput = document.getElementById('port');
const customMessageInput = document.getElementById('customMessage');
const lightsOnBtn = document.getElementById('lightsOnBtn');
const lightsOffBtn = document.getElementById('lightsOffBtn');
const sendCustomBtn = document.getElementById('sendCustomBtn');
const statusDisplay = document.getElementById('statusDisplay');
const ipError = document.getElementById('ipError');
const portError = document.getElementById('portError');
const messageError = document.getElementById('messageError');

// Load saved values from localStorage
function loadSettings() {
    const savedIP = localStorage.getItem('udp_ip');
    const savedPort = localStorage.getItem('udp_port');

    if (savedIP) ipInput.value = savedIP;
    if (savedPort) portInput.value = savedPort;
}

// Save values to localStorage
function saveSettings() {
    localStorage.setItem('udp_ip', ipInput.value);
    localStorage.setItem('udp_port', portInput.value);
}

// Validate IP address format
function validateIP(ip) {
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

// Validate port number
function validatePort(port) {
    const portNum = parseInt(port, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

// Validate message
function validateMessage(message) {
    return message && message.trim().length > 0 && message.length <= 1024;
}

// Clear all error messages
function clearErrors() {
    ipError.textContent = '';
    portError.textContent = '';
    messageError.textContent = '';
    ipInput.classList.remove('error');
    portInput.classList.remove('error');
    customMessageInput.classList.remove('error');
}

// Validate inputs and show errors
function validateInputs(message) {
    clearErrors();
    let isValid = true;

    const ip = ipInput.value.trim();
    const port = portInput.value.trim();

    if (!validateIP(ip)) {
        ipError.textContent = 'Invalid IP address format (e.g., 192.168.1.100)';
        ipInput.classList.add('error');
        isValid = false;
    }

    if (!validatePort(port)) {
        portError.textContent = 'Port must be between 1 and 65535';
        portInput.classList.add('error');
        isValid = false;
    }

    if (message !== null && !validateMessage(message)) {
        messageError.textContent = 'Message must be non-empty and less than 1024 characters';
        customMessageInput.classList.add('error');
        isValid = false;
    }

    return isValid;
}

// Update status display
function updateStatus(message, type = 'idle') {
    statusDisplay.innerHTML = `<p class="status-${type}">${message}</p>`;
}

// Disable all buttons
function setButtonsDisabled(disabled) {
    lightsOnBtn.disabled = disabled;
    lightsOffBtn.disabled = disabled;
    sendCustomBtn.disabled = disabled;
}

// Send UDP message to backend
async function sendUDPMessage(message) {
    if (!validateInputs(message)) {
        return;
    }

    const ip = ipInput.value.trim();
    const port = parseInt(portInput.value.trim(), 10);

    // Save settings
    saveSettings();

    // Update UI
    setButtonsDisabled(true);
    updateStatus(`Sending "${message}" to ${ip}:${port}...`, 'loading');

    try {
        const response = await fetch('/api/send-udp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, ip, port })
        });

        const data = await response.json();

        if (data.success) {
            updateStatus(
                `Successfully sent "${message}" to ${ip}:${port} (${data.details.bytesSent} bytes)`,
                'success'
            );
        } else {
            updateStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Network error: ${error.message}`, 'error');
    } finally {
        setButtonsDisabled(false);
    }
}

// Event Listeners
lightsOnBtn.addEventListener('click', () => {
    sendUDPMessage('lights_on');
});

lightsOffBtn.addEventListener('click', () => {
    sendUDPMessage('lights_off');
});

sendCustomBtn.addEventListener('click', () => {
    const message = customMessageInput.value.trim();
    sendUDPMessage(message);
});

// Allow Enter key to send custom message
customMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = customMessageInput.value.trim();
        sendUDPMessage(message);
    }
});

// Clear error messages on input
ipInput.addEventListener('input', () => {
    ipError.textContent = '';
    ipInput.classList.remove('error');
});

portInput.addEventListener('input', () => {
    portError.textContent = '';
    portInput.classList.remove('error');
});

customMessageInput.addEventListener('input', () => {
    messageError.textContent = '';
    customMessageInput.classList.remove('error');
});

// Initialize
loadSettings();
updateStatus('Ready to send messages', 'idle');
