import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token'); // Це наш access-токен
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Розумна обгортка для автоматичного оновлення токенів за ТЗ Частина 1
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Якщо сервер відповів 401 або 403 (токен згорів)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const refreshToken = localStorage.getItem('refreshToken'); // Беремо довговічний рефреш-токен
    
    if (refreshToken) {
      // Намагаємося отримати новий access-токен
      const refreshResult = await baseQuery(
        {
          url: 'auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Успішно оновили! Записуємо новий токен в локальне сховище
        localStorage.setItem('token', refreshResult.data.access);
        
        // Повторюємо наш початковий запит, який впав, з новим токеном
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Якщо рефреш-токен теж застарів — чистимо пам'ять і відправляємо на логін
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth, // Підключаємо нашу розумну обгортку
  tagTypes: ['Books', 'Profile'],
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: (params) => ({
        url: 'books/',
        params: params, 
      }),
      providesTags: ['Books'],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `books/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'],
    }),
    addBook: builder.mutation({
      query: (newBook) => ({
        url: 'books/',
        method: 'POST',
        body: newBook,
      }),
      invalidatesTags: ['Books'],
    }),
    updateBook: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `books/${id}/`,
        method: 'PATCH',
        body: updatedData,
      }),
      invalidatesTags: ['Books'],
    }),
    scrapeBooks: builder.mutation({
      query: () => ({
        url: 'books/scrape/',
        method: 'POST',
      }),
      invalidatesTags: ['Books'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Profile', 'Books'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'auth/register/', 
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => 'auth/profile/',
      providesTags: ['Profile'],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: 'auth/change-password/', 
        method: 'POST',
        body: passwordData,
      }),
    }),
  }),
});

export const { 
  useGetBooksQuery, 
  useDeleteBookMutation, 
  useAddBookMutation,       
  useUpdateBookMutation,    
  useScrapeBooksMutation,   
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,       
  useChangePasswordMutation 
} = apiSlice;