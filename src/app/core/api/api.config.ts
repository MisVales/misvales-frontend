import { InjectionToken } from '@angular/core';


export interface ApiConfig {
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

export const defaultApiConfig: ApiConfig = {
  // Using a relative path or an environment variable later. For now, a placeholder.
  baseUrl: 'http://localhost:8000/api/v1', 
};
