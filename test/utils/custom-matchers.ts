import { ValidationError } from 'class-validator';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidationError(field: string): R;
    }
  }
}

expect.extend({
  toHaveValidationError(received: ValidationError[], field: string) {
    const hasError = received.some(error => error.property === field);
    
    if (hasError) {
      return {
        message: () => `Expected not to have validation error for field "${field}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected to have validation error for field "${field}"`,
        pass: false,
      };
    }
  },
});