import React from "react";
import { Button, Col, Row } from "reactstrap";
import { useHistory, useLocation } from "react-router-dom";
import { persistence, KEY } from "../../../../services";

interface CompetitionButtonProps {
  buttons: { to: string; label: string }[];
}

const CompetitionButton = ({ buttons }: CompetitionButtonProps) => {
  const history = useHistory();
  const location = useLocation();

  const handleClick = (to: string) => {
    persistence.save(KEY.AFTER_AUTH_PATH, location.pathname);
    history.push(to);
  };

  return (
    <Row>
      {buttons.map(({ to, label }) => (
        <Col xs={12} className="py-1" key={to}>
          <Button size="lg" onClick={() => handleClick(to)} block className="primary-button text-light">
            {label}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default CompetitionButton;
