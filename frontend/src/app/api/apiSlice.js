import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/api/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Books', 'Profile'], // Оголошуємо теги для автоматичного оновлення даних
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: (params) => ({
        url: 'books/',
        params: params, 
      }),
      providesTags: ['Books'], // Цей запит слухає оновлення тегу Books
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `books/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'], // Видалення книги змусить список оновитися
    }),
    addBook: builder.mutation({
      query: (newBook) => ({
        url: 'books/',
        method: 'POST',
        body: newBook,
      }),
      invalidatesTags: ['Books'], // Додавання книги автоматично оновить сітку
    }),
    scrapeBooks: builder.mutation({
      query: () => ({
        url: 'books/scrape/',
        method: 'POST',
      }),
      invalidatesTags: ['Books'], // Парсер закине нові книги, і фронтенд їх відразу підтягне
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
  useAddBookMutation,       // Новий хук
  useScrapeBooksMutation,   // Новий хук
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,       
  useChangePasswordMutation 
} = apiSlice;