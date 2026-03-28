package org.example.backenduvote.errors;

/** Recurso no encontrado → 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
