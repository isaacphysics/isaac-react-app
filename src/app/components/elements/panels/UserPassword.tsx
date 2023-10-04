import {Button, CardBody, Col, FormGroup, Label, Row, UncontrolledTooltip, FormFeedback} from "reactstrap";
import React, {useState} from "react";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {AuthenticationProvider, UserAuthenticationSettingsDTO} from "../../../../IsaacApiTypes";
import {PASSWORD_REQUIREMENTS, loadZxcvbnIfNotPresent, passwordDebounce, validateEmail} from "../../../services";
import {linkAccount, resetPassword, unlinkAccount, useAppDispatch} from "../../../state";
import Password from "../inputs/Password";

interface UserPasswordProps {
    currentPassword?: string;
    currentUserEmail?: string;
    setCurrentPassword: (e: any) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordConfirmed: boolean;
    userAuthSettings: UserAuthenticationSettingsDTO | null;
    setNewPassword: (e: any) => void;
    setNewPasswordConfirm: (e: any) => void;
    newPasswordConfirm: string;
    editingOtherUser: boolean;
    arePasswordsIdentical: boolean;
    passwordMeetsRequirements: boolean;
}

export const UserPassword = (
    {currentPassword, currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordConfirmed, userAuthSettings, setNewPassword, setNewPasswordConfirm, newPasswordConfirm, editingOtherUser, arePasswordsIdentical, passwordMeetsRequirements}: UserPasswordProps) => {

    const dispatch = useAppDispatch();
    const authenticationProvidersUsed = (provider: AuthenticationProvider) => userAuthSettings && userAuthSettings.linkedAccounts && userAuthSettings.linkedAccounts.includes(provider);

    const [passwordResetRequested, setPasswordResetRequested] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    const resetPasswordIfValidEmail = () => {
        if (currentUserEmail && validateEmail(currentUserEmail)) {
            dispatch(resetPassword({email: currentUserEmail}));
            setPasswordResetRequested(true);
        }
    };
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <CardBody className={"pb-0"}>
        <Row className="mb-2">
          <Col md={{ size: 6, offset: 3 }}>
            <div style={{ display: "flex" }}>
              <h4 className="mb-0">Password</h4>
              <span
                id={`password-help-tooltip`}
                className="icon-help mb-0"
                style={{ alignSelf: "center" }}
              />
              <UncontrolledTooltip
                target={`password-help-tooltip`}
                placement="bottom"
              >
                {PASSWORD_REQUIREMENTS}
              </UncontrolledTooltip>
            </div>
          </Col>
        </Row>
        {userAuthSettings && userAuthSettings.hasSegueAccount ? (
          <Row>
            <Col>
              {!editingOtherUser && (
                <Row>
                  <Col md={{ size: 6, offset: 3 }}>
                    <FormGroup>
                      <Label htmlFor="current-password">Current password</Label>
                      <Password
                        passwordFieldType="Current"
                        isPasswordVisible={isPasswordVisible}
                        setIsPasswordVisible={setIsPasswordVisible}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCurrentPassword(e.target.value)
                        }
                        showToggleIcon={true}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}
              <Row>
                <Col md={{ size: 6, offset: 3 }}>
                  <FormGroup>
                    <Label htmlFor="new-password">New password</Label>
                    <Password
                      passwordFieldType="New"
                      isPasswordVisible={isPasswordVisible}
                      setIsPasswordVisible={setIsPasswordVisible}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        passwordDebounce(e.target.value, setPasswordFeedback);
                      }}
                      onBlur={(e) => {
                        passwordDebounce(e.target.value, setPasswordFeedback);
                      }}
                      onFocus={loadZxcvbnIfNotPresent}
                      invalid={!!newPasswordConfirm && !isNewPasswordConfirmed}
                      disabled={!editingOtherUser && currentPassword === ""}
                      showToggleIcon={editingOtherUser}
                    />
                    {passwordFeedback && (
                      <span className="float-right small mt-1">
                        <strong>Password strength: </strong>
                        <span id="password-strength-feedback">
                          {passwordFeedback.feedbackText}
                        </span>
                      </span>
                    )}
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={{ size: 6, offset: 3 }}>
                  <FormGroup>
                    <Label htmlFor="password-confirm">
                      Re-enter new password
                    </Label>
                    <Password
                      passwordFieldType="Confirm"
                      isPasswordVisible={isPasswordVisible}
                      setIsPasswordVisible={setIsPasswordVisible}
                      invalid={!!currentPassword && !isNewPasswordConfirmed}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setNewPasswordConfirm(e.target.value);
                        setMyUser(
                          Object.assign({}, myUser, {
                            password: e.target.value,
                          })
                        );
                      }}
                      disabled={!editingOtherUser && currentPassword == ""}
                      ariaDescribedBy="invalidPassword"
                    />
                    <FormFeedback
                      id="invalidPassword"
                      style={{ display: "block" }}
                    >
                      {!arePasswordsIdentical
                        ? "New passwords must match."
                        : !passwordMeetsRequirements && PASSWORD_REQUIREMENTS}
                    </FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : !passwordResetRequested ? (
          <React.Fragment>
            <Row className="pt-4">
              <Col className="text-center">
                {userAuthSettings && userAuthSettings.linkedAccounts && (
                  <p>
                    You do not currently have a password set for this account;
                    you sign in using{" "}
                    {userAuthSettings.linkedAccounts.map((linked, index) => {
                      return (
                        <span key={index} className="text-capitalize">
                          {linked.toLowerCase()}
                        </span>
                      );
                    })}
                    .
                  </p>
                )}
              </Col>
            </Row>
            <Row className="pb-4">
              <Col className="text-center">
                <Button
                  className="btn-secondary"
                  onClick={resetPasswordIfValidEmail}
                >
                  Click here to add a password
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Col md={{ size: 6, offset: 3 }}>
              <p>
                <strong className="d-block">
                  Your password reset request is being processed.
                </strong>
                <strong className="d-block">Please check your inbox.</strong>
              </p>
            </Col>
          </React.Fragment>
        )}
        <React.Fragment>
          <Row>
            <Col md={{ size: 6, offset: 3 }}>
              <hr className="text-center" />
            </Col>
          </Row>
          <Row>
            <Col md={{ size: 6, offset: 3 }}>
              <FormGroup>
                <h4>Linked Accounts</h4>
                <Col className="text-center">
                  <div className="vertical-center ml-2">
                    <input
                      type="button"
                      id="linked-accounts-no-password"
                      className="linked-account-button google-button"
                      onClick={() =>
                        dispatch(
                          authenticationProvidersUsed("GOOGLE")
                            ? unlinkAccount("GOOGLE")
                            : linkAccount("GOOGLE")
                        )
                      }
                    />
                    <Label
                      htmlFor="linked-accounts-no-password"
                      className="ml-2 mb-0"
                    >
                      {authenticationProvidersUsed("GOOGLE")
                        ? " Remove linked Google account"
                        : " Add linked Google account"}
                    </Label>
                  </div>
                </Col>
              </FormGroup>
            </Col>
          </Row>
        </React.Fragment>
      </CardBody>
    );
};
