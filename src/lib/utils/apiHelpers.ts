/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiResponse } from 'next';
import { ApiResponse, ErrorResponse } from '../models/framinoModel';

export function sendSuccess<T>(res: NextApiResponse, data: T, message?: string): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  res.status(200).json(response);
}

export function sendError(res: NextApiResponse, error: string, statusCode: number = 400, message?: string): void {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
  };
  res.status(statusCode).json(response);
}

export function sendServerError(res: NextApiResponse, error: Error): void {
  console.error('Server Error:', error);
  sendError(res, 'Internal server error', 500, error.message);
}

export function validateRequestMethod(res: NextApiResponse, method: string | undefined, allowedMethods: string[]): boolean {
  if (!method || !allowedMethods.includes(method)) {
    sendError(res, `Method ${method} not allowed`, 405, `Allowed methods: ${allowedMethods.join(', ')}`);
    return false;
  }
  return true;
}

export function validateRequestBody(res: NextApiResponse, body: any, requiredFields: string[]): boolean {
  if (!body) {
    sendError(res, 'Request body is required', 400);
    return false;
  }

  const missingFields = requiredFields.filter(field => !body.hasOwnProperty(field) || body[field] === undefined);
  
  if (missingFields.length > 0) {
    sendError(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
    return false;
  }

  return true;
}

export function validateEnvironmentVariables(requiredEnvVars: string[]): void {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
