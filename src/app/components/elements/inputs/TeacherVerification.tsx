import React from "react";
import { FormGroup, Input, Label } from "reactstrap";

interface TeacherVerificationProps {
  setVerificationDetails: (verificationDetails: string) => void;
  setOtherInformation: (otherInformation: string) => void;
}

const TeacherVerification = ({ setVerificationDetails, setOtherInformation }: TeacherVerificationProps) => {
  return (
    <>
      <FormGroup className="mt-3 mt-md-0">
        <Label htmlFor="user-verification-input">
          URL of a page on your school or college website which shows your name and email address, or your
          school/college phone number
        </Label>
        <Input
          id="user-verification-input"
          type="text"
          name="user-verification"
          onBlur={(e) => setVerificationDetails(e.target.value)}
          required
        />
      </FormGroup>
      <Label htmlFor="other-info-input">Any other information</Label>
      <Input
        id="other-info-input"
        type="textarea"
        name="other-info"
        onBlur={(e) => setOtherInformation(e.target.value)}
      />
    </>
  );
};

export default TeacherVerification;
