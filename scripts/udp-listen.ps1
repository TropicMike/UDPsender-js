$udp = New-Object System.Net.Sockets.UdpClient(9999)
$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
Write-Host "Listening on UDP port 9999..."
while ($true) {
    $bytes = $udp.Receive([ref]$endpoint)
    $msg = [System.Text.Encoding]::UTF8.GetString($bytes)
    Write-Host "$($endpoint.Address):$($endpoint.Port) -> $msg"
}
