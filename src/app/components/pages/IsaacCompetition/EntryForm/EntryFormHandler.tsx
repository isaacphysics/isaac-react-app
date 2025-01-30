import React from "react";
import { Container, Col } from "reactstrap";
import CompetitionEntryForm from "./CompetitionEntryForm";
import CompetitionButton from "../Buttons/CompetitionButton";
import { selectors, useAppSelector } from "../../../../state";
import { isStudent, isTeacher } from "../../../../services";

const STUDENT_MESSAGE = "Students, ask your teacher about submitting an entry.";
const TEACHER_MESSAGE = "Teachers, login to enter the competition.";

const StudentMessage = () => (
  <Container>
    <Col className="d-flex flex-column align-items-start pb-4 pl-0" xs="auto">
      <p className="body-text">{STUDENT_MESSAGE}</p>
    </Col>
  </Container>
);

interface DefaultMessageProps {
  buttons: { to: string; label: string }[];
}

const DefaultMessage: React.FC<DefaultMessageProps> = ({ buttons }) => (
  <Container>
    <Col className="d-flex flex-column align-items-start pb-4 pl-0" xs="auto">
      <p className="pb-3 body-text">{TEACHER_MESSAGE}</p>
      <CompetitionButton buttons={buttons} />
    </Col>
  </Container>
);

interface EntryFormHandlerProps {
  buttons: { to: string; label: string }[];
  handleTermsClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const EntryFormHandler = ({ buttons, handleTermsClick }: EntryFormHandlerProps) => {
  const user = useAppSelector(selectors.user.orNull);

  const renderEntryForm = () => {
    if (isTeacher(user)) {
      return <CompetitionEntryForm handleTermsClick={handleTermsClick} />;
    } else if (isStudent(user)) {
      return <StudentMessage />;
    } else {
      return <DefaultMessage buttons={buttons} />;
    }
  };

  return renderEntryForm();
};

export default EntryFormHandler;
