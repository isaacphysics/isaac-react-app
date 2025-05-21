/*
 * This component has been made to give consent on event registration and account sign up.
 * All new consent given will be added in the database as given consent.
 * All past consent will be displayed as false, however it is applied consent.
 */
import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

interface ConsentText {
  beforeLink: string;
  linkText: string;
  linkTo?: string;
  afterLink: string;
  sameLine?: boolean;
}

interface ConsentProps {
  consentText: (string | ConsentText)[];
  required?: boolean;
  onConsentChange?: (checked: boolean) => void;
}

const Consent = ({ consentText, required = true, onConsentChange }: ConsentProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const inputId = "consent-checkbox";

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onConsentChange) {
      onConsentChange(newCheckedState);
    }
  };

  const renderConsentText = (text: string | ConsentText) => {
    if (typeof text === "string") {
      return text;
    }
    return (
      <>
        {text.beforeLink}
        <Link to={text.linkTo ? text.linkTo : "/privacy"} target="_blank">
          {text.linkText}
        </Link>
        {text.afterLink}
      </>
    );
  };

  return (
    <Row className="mt-2">
      <Col xs="auto" className="d-flex pt-4">
        <input
          id={inputId}
          name="consent"
          aria-label="Consent checkbox"
          className="large-checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          required={required}
          aria-required={required}
        />
        {required && <span className="asterisk ml-2 text-danger">*</span>}
      </Col>
      <Col>
        <label htmlFor={inputId}>
          {consentText.map((text, index) => {
            const nextItem = consentText[index + 1];
            const shouldAddBreak =
              typeof nextItem === "object" && !nextItem?.sameLine && index < consentText.length - 1;

            return (
              <React.Fragment key={`consent-${typeof text === "string" ? "text" : "link"}-${index}`}>
                {renderConsentText(text)}
                {shouldAddBreak && <div className="mt-2" />}
              </React.Fragment>
            );
          })}
        </label>
      </Col>
    </Row>
  );
};

export default Consent;
