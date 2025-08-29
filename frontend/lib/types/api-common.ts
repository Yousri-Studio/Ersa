export interface ContentApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LocaleString {
  ar: string;
  en: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}
