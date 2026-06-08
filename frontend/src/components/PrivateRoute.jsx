import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Якщо токена немає, перекидаємо на логін
  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;