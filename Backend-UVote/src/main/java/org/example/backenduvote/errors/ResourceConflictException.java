package org.example.backenduvote.errors;

/** Conflicto de unicidad o estado → 409. */
public class ResourceConflictException extends RuntimeException {
    public ResourceConflictException(String message) {
        super(message);
    }
}
