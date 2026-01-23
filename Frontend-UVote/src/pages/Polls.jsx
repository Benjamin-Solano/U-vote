import { Link } from "react-router-dom";

function Polls() {
   return (
      <>
         <h1>Encuestas</h1>
         <Link to="/polls/1">Ir a encuesta 1</Link>
      </>
   );
}

export default Polls;
