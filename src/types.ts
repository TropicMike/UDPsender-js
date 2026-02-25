export interface SendUDPRequest {
  message: string;
  ip: string;
  port: number;
}

export interface SendUDPSuccessResponse {
  success: true;
  message: string;
  details: { message: string; ip: string; port: number; bytesSent: number };
}

export interface SendUDPErrorResponse {
  success: false;
  error: string;
}

export type SendUDPResponse = SendUDPSuccessResponse | SendUDPErrorResponse;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
