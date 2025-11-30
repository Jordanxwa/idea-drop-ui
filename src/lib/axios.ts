import  axios from "axios";
import { getStoredAccessToken, setStoredAccessToken } from "./authToken";
import { refreshAccessToken } from "@/api/auth";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_PRODUCTION_API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach token on refresh
api.interceptors.request.use((config)=> {
  const token = getStoredAccessToken()
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


// Refresh token after expire
api.interceptors.response.use((res)=>res, async (err) => {
  const originsReq = err.config
  
  if(err.response?.status === 401 && !originsReq._retry && !originsReq.url.includes('/auth/refresh')){
    originsReq._retry = true
    try {
      const {accessToken: newToken} = await refreshAccessToken();
      setStoredAccessToken(newToken);
      originsReq.headers.Authorization = `Bearer: ${newToken}`
    } catch (err) {
      console.error('Refresh token failed ',err)
    }
  }
  return Promise.reject(err)
})

export default api
