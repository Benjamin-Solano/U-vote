import { useParams } from "react-router-dom";

function PollDetail() {
   const { id } = useParams();

   return <h1>Detalle de encuesta {id}</h1>;
}

export default PollDetail;
