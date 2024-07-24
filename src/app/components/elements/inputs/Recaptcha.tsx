import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Row } from "reactstrap";
interface RecaptchaComponentProps {
  setIsRecaptchaTicked: (boolean: boolean) => void;
  recaptchaRef: React.RefObject<ReCAPTCHA> | null;
}

export const Recaptcha: React.FC<RecaptchaComponentProps> = ({ setIsRecaptchaTicked, recaptchaRef }) => {
  const handleRecaptchaChange = () => {
    setIsRecaptchaTicked(true);
  };

  const handleRecaptchaExpired = () => {
    setIsRecaptchaTicked(false);
  };

  return (
    <Row className="justify-content-center">
      <ReCAPTCHA
        sitekey={GOOGLE_RECAPTCHA_SITE_KEY_ENV}
        ref={recaptchaRef}
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
      />
    </Row>
  );
};
