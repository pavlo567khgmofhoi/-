import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile'; // Імпортуємо нову сторінку профілю
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Захищений маршрут до головної бібліотеки */}
        <Route path="/" element={
          <PrivateRoute>
            <Library />
          </PrivateRoute>
        } />

        {/* Захищений маршрут до сторінки профілю */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        {/* Захищений маршрут до детальної сторінки книги */}
        <Route path="/book/:id" element={
          <PrivateRoute>
            <BookDetail />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;