import { useContext, useState } from "react";

import api from "../api/api";
// import { GlobalContext } from "../context/GlobalContext";

export function usePost(url, { onSuccess, onError } = {}) {
  // const { loading, setLoading } = useContext(GlobalContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const post = async (payload, config = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post(url, payload, config);
      onSuccess?.(res, res);
      return res.data;
    } catch (error) {
    
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { post, error, isLoading };
}
