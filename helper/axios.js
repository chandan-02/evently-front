import axios from "axios";
// Setting up base Url for fetching data

const fetcher = axios.create({
    baseURL: 'https://evently-backend-api.herokuapp.com/api/v1', //dev
    // baseURL: 'https://alkemi-backend.herokuapp.com/api/v1', //dev
    headers: {
        "Content-Type": "application/json",
        // 'Acess-Control-Allow-Origin':'*',
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
        // Authorization: `Bearer ${typeof window !== 'undefined' && localStorage.getItem('token')}`,
        // Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWFpbiBhZG1pbiIsImVtYWlsIjoiYWxrZW1pLnRlY2huaWNhbGRlcGFydG1lbnRAZ21haWwuY29tIiwidXNlcmlkIjoiNjI0ZWJiNmY3NThjYWFkNmQ1NjJhODQ4IiwiaWF0IjoxNjUxNTg3NTAwLCJleHAiOjE2NTIxOTIzMDB9.b3cVIT6dcO20ViD5DVvWDmovNMToiF_VYmMIEH4rQ5Q`,
        Accept: "application/json",
    },
});

export default fetcher;