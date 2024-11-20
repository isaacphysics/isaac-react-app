import React from "react";
import { Button, Col, Row } from "reactstrap";

interface CompetitionButtonProps {
  buttons: { to: string; label: string }[];
}

const CompetitionButton = ({ buttons }: CompetitionButtonProps) => (
  <Row>
    {buttons.map(({ to, label }) => (
      <Col xs={12} className="py-1" key={to}>
        <Button
          size="lg"
          tag="a"
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          block
          className="primary-button text-light"
        >
          {label}
        </Button>
      </Col>
    ))}
  </Row>
);

export default CompetitionButton;
