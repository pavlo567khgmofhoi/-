import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice'; // Імпортуємо наш API слайс

export const store = configureStore({
  reducer: {
    // Додаємо apiSlice.reducer за допомогою його reducerPath
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Додаємо middleware, щоб працювали кешування та запити RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});