import axios, { AxiosError } from 'axios';
import { parseCookies,setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api'
})

let isRefreshing = false
let failedRequestQueue = []

export function setupAPIClient(ctx = undefined){
    let cookies = parseCookies(ctx);

    const apiAuth = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearrer ${cookies['nextauth.token']}`
        }
    })
    
    apiAuth.interceptors.response.use(response => {
        return response
    }, (error: AxiosError) => {
        if(error.response.status === 401) {
            if(error.response.data?.code === 'token.expired'){
                //renovar token
                cookies = parseCookies(ctx);
    
                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config;
    
                if(!isRefreshing){
                    isRefreshing = true
    
                    apiAuth.post('/refresh',{
                        refreshToken
                    }).then(response => {
                        const { token } = response.data
    
                        setCookie(ctx, 'nextauth.token', token,{
                            maxAge: 60 * 60 * 24* 30, // 30 dias
                            path: '/',
                        })
    
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken,{
                            maxAge: 60 * 60 * 24* 30, // 30 dias
                            path: '/',
                        })
                        
                        apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`;
    
                        failedRequestQueue.forEach(request => request.onSuccess(token))
                        failedRequestQueue = [];
    
                    }).catch((err) => {
    
                        failedRequestQueue.forEach(request => request.onFailure(err))
                        failedRequestQueue = [];
    
                    }).finally(() => {
                        isRefreshing = false;
                    })
    
                }
    
                return new Promise((resolve, reject) => {
                    failedRequestQueue.push(
                        {
                            onSuccess: (token: string) => {
                                originalConfig.headers['Authorization'] = `Bearer ${token}`;
                                resolve(apiAuth(originalConfig))
                            },
                            onFailure: (err: AxiosError) => {
                                reject(err)
                            },
                        }
                    )
                })
                
            }else{
                if(process.browser){
                    signOut()
                }else{
                    return Promise.reject(new AuthTokenError())
                }
            }
        }
    
        return Promise.reject(error);
    })

    return apiAuth
}