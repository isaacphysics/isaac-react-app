import React from "react";
import { Link } from "react-router-dom";
import { Button, Col, Row } from "reactstrap";

interface CompetitionButtonProps {
  buttons: { to: string; label: string }[];
}

const CompetitionButton = ({ buttons }: CompetitionButtonProps) => (
  <Row>
    {buttons.map(({ to, label }) => (
      <Col xs={12} className="py-1" key={to}>
        <Button size="lg" tag={Link} to={to} block className="primary-button text-light">
          {label}
        </Button>
      </Col>
    ))}
  </Row>
);

export default CompetitionButton;
