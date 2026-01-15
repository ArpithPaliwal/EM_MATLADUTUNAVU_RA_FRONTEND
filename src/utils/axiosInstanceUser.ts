import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_BASE,
    withCredentials:true
})

api.interceptors.response.use(
    (res)=>res,
    async (err)=>{
        const original = err.config;

        if(err.response?.status === 401 && !original._retry){
            original._retry = true;

            try {
                await api.post("/users/refresh-token");
                return api(original)
            } catch (error) {
                console.log(error);
                
                window.location.href = "/Login";
            }
        }
        return Promise.reject(err);
    }
)
export default api;