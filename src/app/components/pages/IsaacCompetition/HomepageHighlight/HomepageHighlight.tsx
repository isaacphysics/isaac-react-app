import React from "react";
import { Container, Row } from "reactstrap";
import CompetitionButton from "../Buttons/CompetitionButton";

const HomepageHighlight = () => {
  return (
    <Container className="pt-2 pb-5">
      <Row className="homepage-highlight rounded justify-content-center">
        <Row className="justify-content-center">
          <h1 className="homepage-highlight-sub-title py-4">2025 Isaac Computer Science competition</h1>
          <h1 className="homepage-highlight-title pb-4">Entries are now open</h1>
        </Row>
        <Row className="pb-4">
          <CompetitionButton
            buttons={[
              {
                to: "/national-computer-science-competition",
                label: "Enter the competition",
              },
            ]}
          />
        </Row>
      </Row>
    </Container>
  );
};

export default HomepageHighlight;
