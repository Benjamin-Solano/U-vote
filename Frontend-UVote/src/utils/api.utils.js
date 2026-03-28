/**
 * Extrae el array de datos de una respuesta de API que puede ser:
 * - Un objeto paginado de Spring: { content: [...], totalElements, ... }
 * - Un array directo (formato legacy)
 * Retorna siempre un array.
 */
export function extractList(responseData) {
   if (Array.isArray(responseData?.content)) return responseData.content;
   if (Array.isArray(responseData)) return responseData;
   return [];
}
