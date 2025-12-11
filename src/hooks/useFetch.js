import axios from "axios";
import { useCallback } from "react";

function useFetch() {
  const fetchData = useCallback(async ({ method, url, data, params,onUploadProgress  }) => {
    try {
      const token = sessionStorage.getItem("token");

      const axiosConfig = {
        method,
        url,
        ...(data && { data }),
        ...(params && { params }),
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...(data instanceof FormData && {
            "Content-Type": "multipart/form-data",
          }),
        },
         ...(onUploadProgress && { onUploadProgress }),
      };

      const result = await axios(axiosConfig);
      return result?.data;      // IMPORTANT: return full axios response
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  }, []);

  return [fetchData];
}

export default useFetch;
