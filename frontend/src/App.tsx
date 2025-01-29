import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KitsPage } from "./pages/kits/KitsPage";
import { KitDetailPage } from "./pages/kits/KitDetailPage";
import { Layout } from "./components/Layout";
import { ItemsPage } from "./pages/items/ItemsPage";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Toaster />
          <Routes>
            <Route path="/" element={<KitsPage />} />
            <Route path="/kits/:id" element={<KitDetailPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
