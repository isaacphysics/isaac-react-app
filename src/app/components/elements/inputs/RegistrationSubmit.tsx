import React, { useState } from "react";
import { Col, Input, Row } from "reactstrap";
import Consent from "../consent/Consent";
import { consentData } from "../consent/consentData";

interface RegistrationSubmitProps {
  isRecaptchaTicked: boolean;
}

const { SignUpConsent } = consentData.consent;

export const RegistrationSubmit: React.FC<RegistrationSubmitProps> = ({ isRecaptchaTicked }) => {
  const [isConsented, setIsConsented] = useState(false);

  const handleConsentChange = (checked: boolean) => {
    setIsConsented(checked);
  };

  return (
    <>
      <Row className="justify-content-center">
        <Col md={9} className="text-start mt-3">
          <Consent consentText={SignUpConsent} required={true} onConsentChange={handleConsentChange} />
        </Col>
      </Row>

      <Row className="mt-4 mb-2">
        <Col md={{ size: 6, offset: 3 }}>
          <Input
            type="submit"
            value="Register my account"
            //Button is disabled if recaptcha is not ticked and consent is not given
            disabled={!isRecaptchaTicked || !isConsented}
            className="btn btn-block btn-secondary border-0"
          />
        </Col>
      </Row>
    </>
  );
};
