import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRouter from "./router/AppRouter";

// Estadisticas de Vercel
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-content">
        <AppRouter />
        <Analytics />
      </main>

      <Footer />
    </div>
  );
}

export default App;
