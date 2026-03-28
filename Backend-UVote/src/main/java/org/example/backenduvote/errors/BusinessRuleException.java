package org.example.backenduvote.errors;

/** Violación de regla de negocio → 400. */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
