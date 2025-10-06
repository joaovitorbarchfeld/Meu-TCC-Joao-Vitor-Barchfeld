import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';
import VeiculosPage from './pages/VeiculosPage';
import ReservasPage from './pages/ReservasPage';
import UsuariosPage from './pages/UsuariosPage';
import DispositivosPage from './pages/DispositivosPage';   
import RelatoriosPage from './pages/RelatoriosPage';



// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/veiculos"
          element={
            <ProtectedRoute>
              <VeiculosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispositivos"
          element={
            <ProtectedRoute>
              <DispositivosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
          <Route 
     path="/relatorios" 
     element={
       <ProtectedRoute>
         <RelatoriosPage />
       </ProtectedRoute>
     } 
   />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <ReservasPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;