import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import TopBar from './components/TopBar';
import BottomTabBar from './components/BottomTabBar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import KitchenRoute from './components/KitchenRoute';
import MenuPage from './pages/MenuPage';
import MenuItemPage from './pages/MenuItemPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import AccountPage from './pages/AccountPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminHoursPage from './pages/AdminHoursPage';
import KitchenQueuePage from './pages/KitchenQueuePage';
import KitchenScanPage from './pages/KitchenScanPage';
import NotFoundPage from './pages/NotFoundPage';

function Layout({ children }) {
  const location = useLocation();
  const hasOwnHeader = /^\/menu\/[^/]+$/.test(location.pathname);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white">
      {!hasOwnHeader && <TopBar />}
      <main className="pb-20">{children}</main>
      <BottomTabBar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/menu/:id" element={<MenuItemPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/account" element={<AccountPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              </Route>

              <Route element={<KitchenRoute />}>
                <Route path="/kitchen" element={<KitchenQueuePage />} />
                <Route path="/kitchen/scan" element={<KitchenScanPage />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/menu" element={<AdminMenuPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/admin/hours" element={<AdminHoursPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
