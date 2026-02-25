// Inline API response types (cannot import from src/types.ts with module: "None")
interface SendUDPSuccessResponse {
  success: true;
  message: string;
  details: { message: string; ip: string; port: number; bytesSent: number };
}

interface SendUDPErrorResponse {
  success: false;
  error: string;
}

type SendUDPResponse = SendUDPSuccessResponse | SendUDPErrorResponse;

// DOM Elements
const ipInput = document.getElementById('ipAddress') as HTMLInputElement;
const portInput = document.getElementById('port') as HTMLInputElement;
const customMessageInput = document.getElementById('customMessage') as HTMLInputElement;
const lightsOnBtn = document.getElementById('lightsOnBtn') as HTMLButtonElement;
const lightsOffBtn = document.getElementById('lightsOffBtn') as HTMLButtonElement;
const sendCustomBtn = document.getElementById('sendCustomBtn') as HTMLButtonElement;
const statusDisplay = document.getElementById('statusDisplay') as HTMLElement;
const ipError = document.getElementById('ipError') as HTMLElement;
const portError = document.getElementById('portError') as HTMLElement;
const messageError = document.getElementById('messageError') as HTMLElement;

// Load saved values from localStorage
function loadSettings(): void {
    const savedIP = localStorage.getItem('udp_ip');
    const savedPort = localStorage.getItem('udp_port');

    if (savedIP) ipInput.value = savedIP;
    if (savedPort) portInput.value = savedPort;
}

// Save values to localStorage
function saveSettings(): void {
    localStorage.setItem('udp_ip', ipInput.value);
    localStorage.setItem('udp_port', portInput.value);
}

// Validate IP address format
function validateIP(ip: string): boolean {
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

// Validate port number
function validatePort(port: string): boolean {
    const portNum = parseInt(port, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

// Validate message
function validateMessage(message: string): boolean {
    return message.trim().length > 0 && message.length <= 1024;
}

// Clear all error messages
function clearErrors(): void {
    ipError.textContent = '';
    portError.textContent = '';
    messageError.textContent = '';
    ipInput.classList.remove('error');
    portInput.classList.remove('error');
    customMessageInput.classList.remove('error');
}

// Validate inputs and show errors
function validateInputs(message: string | null): boolean {
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
function updateStatus(message: string, type: string = 'idle'): void {
    statusDisplay.innerHTML = `<p class="status-${type}">${message}</p>`;
}

// Disable all buttons
function setButtonsDisabled(disabled: boolean): void {
    lightsOnBtn.disabled = disabled;
    lightsOffBtn.disabled = disabled;
    sendCustomBtn.disabled = disabled;
}

// Send UDP message to backend
async function sendUDPMessage(message: string): Promise<void> {
    if (!validateInputs(message)) {
        return;
    }

    const ip = ipInput.value.trim();
    const port = parseInt(portInput.value.trim(), 10);

    saveSettings();

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

        const data = await response.json() as SendUDPResponse;

        if (data.success) {
            updateStatus(
                `Successfully sent "${message}" to ${ip}:${port} (${data.details.bytesSent} bytes)`,
                'success'
            );
        } else {
            updateStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Network error: ${(error as Error).message}`, 'error');
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

customMessageInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        const message = customMessageInput.value.trim();
        sendUDPMessage(message);
    }
});

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
