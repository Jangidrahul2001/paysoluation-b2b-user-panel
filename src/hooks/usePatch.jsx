import { useContext, useState } from "react";
import api from "../api/api";

export function usePatch( { onSuccess, onError } = {}) {
  const [error, setError] = useState(null);

  const patch = async (url,payload) => {
    setError(null);

    try {
      const res = await api.patch(url, payload);
      onSuccess?.(res, res);
      return res;
    } catch (error) {
      setError(error);
      onError?.(error);
      throw error;
    } 
  };

  return { patch, error };
}
