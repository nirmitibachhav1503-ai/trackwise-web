import axios from "axios";

const api =
axios.create({

    baseURL:
    import.meta.env
    .VITE_API_URL,

    headers:
    {
        "Content-Type":
        "application/json"
    }
});

api.interceptors.request.use(
(
    config
) =>
{
    const token =
        localStorage.getItem(
            "token"
        );

    if(token)
    {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(

    response =>
    response,

    error =>
    {
        const requestUrl =
            error.config?.url
            ?? "";

        const isLoginRequest =
            requestUrl
                .toLowerCase()
                .includes(
                    "/api/auth/login"
                );

        if(
            error.response?.status
            === 401
            && !isLoginRequest
        )
        {
            localStorage.clear();

            window.location.href =
                "/";
        }

        return Promise.reject(
            error
        );
    }
);

export default api;
