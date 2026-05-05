import { useContext, useState } from "react";

import api from "../api/api";
import { GlobalContext } from "../context/GlobalContext";

export function usePut(url, { onSuccess, onError } = {}) {
  const { loading, setLoading } = useContext(GlobalContext);
  const [error, setError] = useState(null);

  const put = async (id, payload) => {
    setLoading(true);
    setError(null);

    const urlId = `${url}/${id}`;
    try {
      const res = await api.put(urlId, payload);
    
      onSuccess?.(res, res);
      return res;
    } catch (error) {
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { put, error };
}
