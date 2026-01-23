import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-content">
        <AppRouter />
      </main>

      <Footer />
    </div>
  );
}

export default App;
