import { useState } from 'react';

interface APIResponse<T = any> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export const usePayloadAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Ein Fehler ist aufgetreten'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = <T>(url: string) => {
    return handleRequest<APIResponse<T>>(url);
  };

  const post = <T>(url: string, data: any) => {
    return handleRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const patch = <T>(url: string, data: any) => {
    return handleRequest<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  };

  const del = <T>(url: string) => {
    return handleRequest<T>(url, {
      method: 'DELETE',
    });
  };

  return {
    get,
    post,
    patch,
    delete: del,
    loading,
    error,
  };
};

export default usePayloadAPI; 