import {
  BatchPredictResponse,
  HealthResponse,
  ModelInfoResponse,
  PredictResponse,
  SessionData,
} from "../types";

export interface ApiClientError extends Error {
  status?: number;
  detail?: string;
  isNetworkError?: boolean;
}

const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return url.replace(/\/+$/, "");
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorDetail = "";
  try {
    const errorJson = await response.json();
    if (typeof errorJson.detail === "string") {
      errorDetail = errorJson.detail;
    } else if (Array.isArray(errorJson.detail)) {
      // Format FastAPI pydantic validation errors nicely
      errorDetail = errorJson.detail
        .map((err: { loc?: (string | number)[]; msg?: string }) => {
          const field = err.loc ? err.loc.filter((part) => part !== "body").join(".") : "Field";
          return `${field ? field + ": " : ""}${err.msg || "Invalid value"}`;
        })
        .join("; ");
    } else if (errorJson.message) {
      errorDetail = errorJson.message;
    } else {
      errorDetail = JSON.stringify(errorJson);
    }
  } catch {
    errorDetail = await response.text();
  }

  const error = new Error(
    response.status === 503
      ? "The prediction model isn't available right now."
      : errorDetail || `Request failed with status ${response.status}`
  ) as ApiClientError;

  error.status = response.status;
  error.detail = errorDetail;
  throw error;
};

export const checkHealth = async (): Promise<HealthResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return await handleResponse<HealthResponse>(res);
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    const networkErr = new Error(
      "Cannot reach the prediction server. Make sure the backend is running."
    ) as ApiClientError;
    networkErr.isNetworkError = true;
    throw networkErr;
  }
};

export const getModelInfo = async (): Promise<ModelInfoResponse> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/model-info`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return await handleResponse<ModelInfoResponse>(res);
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    const networkErr = new Error(
      "Cannot reach the prediction server. Make sure the backend is running."
    ) as ApiClientError;
    networkErr.isNetworkError = true;
    throw networkErr;
  }
};

export const predictIntent = async (
  session: SessionData
): Promise<PredictResponse> => {
  const baseUrl = getApiBaseUrl();
  // Filter out undefined and null values or keep explicit nulls according to contract
  // In FastAPI Session schema: all fields are Optional[...].
  // Pydantic accepts explicit null or missing keys.
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(session)) {
    if (value !== undefined && value !== null) {
      payload[key] = value;
    }
  }

  try {
    const res = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse<PredictResponse>(res);
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    const networkErr = new Error(
      "Cannot reach the prediction server. Make sure the backend is running."
    ) as ApiClientError;
    networkErr.isNetworkError = true;
    throw networkErr;
  }
};

export const predictBatch = async (
  file: File
): Promise<BatchPredictResponse> => {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${baseUrl}/predict/batch`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    return await handleResponse<BatchPredictResponse>(res);
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    const networkErr = new Error(
      "Cannot reach the prediction server. Make sure the backend is running."
    ) as ApiClientError;
    networkErr.isNetworkError = true;
    throw networkErr;
  }
};
