'use client';

import { useState, useCallback, useMemo } from 'react';

export function useStepperFlow({ steps, validateStep, initialStep = 0 }) {
  const [activeStep, setActiveStep] = useState(initialStep);

  const canGoBack = activeStep > 0;
  const canGoNext = activeStep < steps.length - 1;
  const isLastStep = activeStep === steps.length - 1;
  const currentStep = steps[activeStep] || null;

  const goNext = useCallback(() => {
    if (validateStep) {
      const isValid = validateStep(activeStep);
      if (!isValid) return false;
    }
    if (canGoNext) {
      setActiveStep((prev) => prev + 1);
      return true;
    }
    return false;
  }, [activeStep, canGoNext, validateStep]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setActiveStep((prev) => prev - 1);
      return true;
    }
    return false;
  }, [canGoBack]);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setActiveStep(stepIndex);
      return true;
    }
    return false;
  }, [steps.length]);

  const reset = useCallback(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  return useMemo(() => ({
    activeStep,
    currentStep,
    canGoBack,
    canGoNext,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    reset,
  }), [activeStep, currentStep, canGoBack, canGoNext, isLastStep, goNext, goBack, goToStep, reset]);
}

export default useStepperFlow;
