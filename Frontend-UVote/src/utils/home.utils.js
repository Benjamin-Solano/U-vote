export const PAGE_SIZE = 5;

export function getPollStatus(poll) {
   const now = new Date();

   const inicio = poll?.fechaInicio ? new Date(poll.fechaInicio) : null;
   const cierre = poll?.fechaCierre ? new Date(poll.fechaCierre) : null;

   if (inicio && !Number.isNaN(inicio.getTime()) && now < inicio) {
      return { key: "pending", label: "Pendiente" };
   }

   if (cierre && !Number.isNaN(cierre.getTime()) && now >= cierre) {
      return { key: "closed", label: "Cerrada" };
   }

   return { key: "open", label: "Activa" };
}

export function formatDateShort(value) {
   if (!value) return "—";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return "—";
   return date.toLocaleDateString();
}

export function paginate(items, page, pageSize) {
   const start = (page - 1) * pageSize;
   return items.slice(start, start + pageSize);
}

export function pickVotesValue(option) {
   const raw =
      option?.cantidadVotos ??
      option?.totalVotos ??
      option?.votos ??
      option?.conteoVotos ??
      option?.numeroVotos ??
      option?.voteCount ??
      0;

   const value = Number(raw);
   return Number.isFinite(value) ? value : 0;
}

export function normalizePollOptions(poll) {
   const source =
      poll?.opciones ??
      poll?.opcionesDto ??
      poll?.options ??
      poll?.choices ??
      [];

   if (!Array.isArray(source)) return [];

   return source.map((option, index) => ({
      id: option?.id ?? index + 1,
      label:
         option?.nombre ??
         option?.titulo ??
         option?.texto ??
         option?.descripcion ??
         `Opción ${index + 1}`,
      votes: pickVotesValue(option),
   }));
}

export function getPollTotalVotes(poll) {
   const direct =
      poll?.totalVotos ??
      poll?.cantidadVotos ??
      poll?.votes ??
      poll?.voteCount;

   if (Number.isFinite(Number(direct))) {
      return Number(direct);
   }

   return normalizePollOptions(poll).reduce((acc, option) => acc + option.votes, 0);
}

export function buildPollMetrics(poll) {
   if (!poll) return null;

   const options = normalizePollOptions(poll);
   const totalVotes = getPollTotalVotes(poll);

   const safeOptions = options.map((option) => ({
      ...option,
      percent: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
   }));

   const leader =
      safeOptions.length > 0
         ? [...safeOptions].sort((a, b) => b.votes - a.votes)[0]
         : null;

   return {
      poll,
      totalVotes,
      options: safeOptions,
      leader,
      status: getPollStatus(poll),
   };
}