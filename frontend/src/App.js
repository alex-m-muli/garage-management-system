// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout wrapper that includes TopBar, Sidebar, Footer
import DashboardLayout from './components/DashboardLayout';

// Component imports
import Home from './components/Home';
import CustomerDashboard from './components/CustomerDashboard';
import AddcustomerForm from './components/AddcustomerForm';
import CustomerHistory from './components/CustomerHistory';
import SupplierManagement from './components/SupplierManagement';
import LaborTracking from './components/LaborTracking';
import UserManagement from './components/UserManagement';
import InventoryManagement from './components/InventoryManagement';
import ReportsDashboard from './components/ReportsDashboard';
import JobCardForm from './components/JobCardForm';
import JobCardList from './components/JobCardList';
import LoginForm from './components/Login';
import Services from './components/Services';
import BackupRestore from './components/BackupRestore';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginForm />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Navigate to="/homepage" replace /></ProtectedRoute>} />

          {/* Homepage remains standalone */}
          <Route path="/homepage" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Pages wrapped with DashboardLayout */}
          <Route path="/services" element={<ProtectedRoute><DashboardLayout><Services /></DashboardLayout></ProtectedRoute>} />
          <Route path="/customer-dashboard" element={<ProtectedRoute><DashboardLayout><CustomerDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/add-customer" element={<ProtectedRoute><DashboardLayout><AddcustomerForm /></DashboardLayout></ProtectedRoute>} />
          <Route path="/customer-history/:mobile" element={<ProtectedRoute><DashboardLayout><CustomerHistory /></DashboardLayout></ProtectedRoute>} />
          <Route path="/supplier-management" element={<ProtectedRoute><DashboardLayout><SupplierManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/labor-tracking" element={<ProtectedRoute><DashboardLayout><LaborTracking /></DashboardLayout></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><DashboardLayout><UserManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/inventory-management" element={<ProtectedRoute><DashboardLayout><InventoryManagement /></DashboardLayout></ProtectedRoute>} />
          <Route path="/reports-management" element={<ProtectedRoute><DashboardLayout><ReportsDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/jobcard-management" element={<ProtectedRoute><DashboardLayout><JobCardForm /></DashboardLayout></ProtectedRoute>} />
          <Route path="/jobcardform/:id" element={<ProtectedRoute><DashboardLayout><JobCardForm /></DashboardLayout></ProtectedRoute>} />
          <Route path="/jobcard-list" element={<ProtectedRoute><DashboardLayout><JobCardList /></DashboardLayout></ProtectedRoute>} />
          <Route path="/backup-restore" element={<ProtectedRoute><DashboardLayout><BackupRestore />
          </DashboardLayout></ProtectedRoute>} />

          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
