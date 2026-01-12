import axios from 'axios';



const api = axios.create({
    baseURL: `${import.meta.env.PROD}/api`,
});

export default api;
