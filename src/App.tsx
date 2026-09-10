/**
 * Composição raiz do app com as rotas da aplicação.
 *
 * - Pública: `/` (landing).
 * - Painel: `/admin/login` (pública) e `/admin/*` protegidos pelo
 *   `ProtectedRoute` (sem token → redireciona para o login).
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AuthProvider } from "@/features/auth/context/auth.provider";
import { AdminLayout } from "@/app/admin/components/AdminLayout";
import { ContactPage } from "@/app/admin/pages/ContactPage";
import { ContentPage } from "@/app/admin/pages/ContentPage";
import { DashboardPage } from "@/app/admin/pages/DashboardPage";
import { LoginPage } from "@/app/admin/pages/LoginPage";
import { ProductsPage } from "@/app/admin/pages/ProductsPage";
import { HomePage } from "@/app/(public)/pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/admin/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
