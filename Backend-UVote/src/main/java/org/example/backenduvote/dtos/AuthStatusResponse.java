package org.example.backenduvote.dtos;

public class AuthStatusResponse {

    private String nextStep;            // "VERIFY" | "LOGIN"
    private Integer resendAvailableIn;  // segundos (solo si nextStep=VERIFY)

    public AuthStatusResponse() {}

    public AuthStatusResponse(String nextStep, Integer resendAvailableIn) {
        this.nextStep = nextStep;
        this.resendAvailableIn = resendAvailableIn;
    }

    public String getNextStep() {
        return nextStep;
    }

    public Integer getResendAvailableIn() {
        return resendAvailableIn;
    }

    public void setNextStep(String nextStep) {
        this.nextStep = nextStep;
    }

    public void setResendAvailableIn(Integer resendAvailableIn) {
        this.resendAvailableIn = resendAvailableIn;
    }
}
