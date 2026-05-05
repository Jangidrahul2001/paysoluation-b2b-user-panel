import { useContext, useState } from "react";
import api from "../api/api";

export function useDelete(url, { onSuccess, onError } = {}) {

  const remove = async (payload) => {

  
    try {
      const res = await api.delete(url,  { data: payload });
      onSuccess?.(res);
      return res.data;
    } catch (error) {
      onError?.(error);
      throw error;
    } 
  };

  return { remove };
}
