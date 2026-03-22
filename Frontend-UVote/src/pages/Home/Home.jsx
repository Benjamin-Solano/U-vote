import "./home-base.css";
import "./home-landing.css";
import "./home-dashboard.css";

import { useAuth } from "../../auth/useAuth";
import HomeLanding from "./HomeLanding";
import HomeDashboard from "./HomeDashboard";

export default function Home() {
   const { isAuthenticated } = useAuth();

   return (
      <main className="uv-home">
         <div className="container">
            {isAuthenticated ? <HomeDashboard /> : <HomeLanding />}
         </div>
      </main>
   );
}