import React, { useRef } from "react";

interface MockReCAPTCHAProps {
  onChange: () => void;
}

export interface MockReCAPTCHARef {
  getValue: () => string | null;
}

const MockReCAPTCHA: React.ForwardRefRenderFunction<MockReCAPTCHARef, MockReCAPTCHAProps> = ({ onChange }, ref) => {
  const valueRef = useRef<string | null>(null);

  const handleCheckboxChange = () => {
    valueRef.current = "mocked-recaptcha-token";
    onChange();
  };

  React.useImperativeHandle(ref, () => ({
    getValue: () => valueRef.current,
  }));

  return (
    <div data-testid="mock-recaptcha">
      <label>
        <input type="checkbox" onChange={handleCheckboxChange} data-testid="mock-recaptcha-checkbox" />I am a mock
        reCAPTCHA checkbox
      </label>
    </div>
  );
};

export default React.forwardRef(MockReCAPTCHA);
