'use client';

import { Box, Stepper, Step, StepLabel, Button, Stack } from '@mui/material';

export function StepperFlow({
  steps,
  activeStep,
  children,
  onNext,
  onBack,
  onComplete,
  nextLabel = 'Next',
  backLabel = 'Back',
  completeLabel = 'Complete',
  disableNext = false,
}) {
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onNext?.();
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.id}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        {children}
      </Box>

      <Stack direction="row" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isFirstStep}
        >
          {backLabel}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={disableNext}
        >
          {isLastStep ? completeLabel : nextLabel}
        </Button>
      </Stack>
    </Box>
  );
}

export default StepperFlow;
