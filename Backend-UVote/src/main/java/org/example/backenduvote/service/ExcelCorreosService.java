
package org.example.backenduvote.service;

import org.apache.poi.ss.usermodel.*;
import org.example.backenduvote.dtos.CargaCorreosResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ExcelCorreosService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@est\\.una\\.ac\\.cr$"
    );

    public ResultadoParseoCorreos procesarArchivo(MultipartFile file) {
        validarArchivo(file);

        List<String> correosLeidos = new ArrayList<>();
        List<String> correosInvalidos = new ArrayList<>();
        Set<String> correosValidosUnicos = new LinkedHashSet<>();

        int totalDuplicados = 0;

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;

            if (sheet == null) {
                throw new IllegalArgumentException("El archivo Excel no contiene hojas");
            }

            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                if (row == null) continue;

                Cell cell = row.getCell(0);
                if (cell == null) continue;

                String valor = normalizarCorreo(formatter.formatCellValue(cell));

                if (valor.isBlank()) {
                    continue;
                }

                correosLeidos.add(valor);

                if (!esCorreoInstitucionalValido(valor)) {
                    correosInvalidos.add(valor);
                    continue;
                }

                boolean agregado = correosValidosUnicos.add(valor);
                if (!agregado) {
                    totalDuplicados++;
                }
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("No se pudo leer el archivo Excel");
        }

        if (correosLeidos.isEmpty()) {
            throw new IllegalArgumentException("El archivo no contiene correos para procesar");
        }

        CargaCorreosResponse resumen = new CargaCorreosResponse();
        resumen.setTotalLeidos(correosLeidos.size());
        resumen.setTotalValidos(correosValidosUnicos.size());
        resumen.setTotalInvalidos(correosInvalidos.size());
        resumen.setTotalDuplicados(totalDuplicados);
        resumen.setCorreosInvalidos(correosInvalidos);

        return new ResultadoParseoCorreos(new ArrayList<>(correosValidosUnicos), resumen);
    }

    private void validarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Debes adjuntar un archivo Excel");
        }

        String nombre = file.getOriginalFilename();
        if (nombre == null || (!nombre.toLowerCase().endsWith(".xlsx") && !nombre.toLowerCase().endsWith(".xls"))) {
            throw new IllegalArgumentException("El archivo debe ser de tipo .xlsx o .xls");
        }
    }

    private boolean esCorreoInstitucionalValido(String correo) {
        return EMAIL_PATTERN.matcher(correo).matches();
    }

    private String normalizarCorreo(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    public static class ResultadoParseoCorreos {
        private final List<String> correosValidos;
        private final CargaCorreosResponse resumen;

        public ResultadoParseoCorreos(List<String> correosValidos, CargaCorreosResponse resumen) {
            this.correosValidos = correosValidos;
            this.resumen = resumen;
        }

        public List<String> getCorreosValidos() {
            return correosValidos;
        }

        public CargaCorreosResponse getResumen() {
            return resumen;
        }
    }
}