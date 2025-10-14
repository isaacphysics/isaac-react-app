import React from "react";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";

interface TimelineEntry {
  event: string;
  date: string;
}

interface CompetitionTimelineProps {
  title: string;
  content: string;
  entries: TimelineEntry[];
}

const CompetitionTimeline = ({ title, content, entries }: CompetitionTimelineProps) => (
  <section className="competition-timeline mt-4 mb-2">
    <h3 className="competition-timeline-title">{title}</h3>
    <p className="competition-timeline-content">{content}</p>
    <Row className="p-4">
      {entries.map((entry, index) => (
        <Col
          key={index}
          xs={12}
          lg={3}
          className={`competition-timeline-box-container competition-timeline-background-${index + 1}`}
        >
          <Card className={`h-100 competition-timeline-background-${index + 1} competition-information-no-border`}>
            <CardTitle tag="h3" className="competition-timeline-header pt-4 px-3">
              {entry.event}
            </CardTitle>
            <CardBody>
              <CardText tag="h3" className="competition-timeline-date">
                {entry.date}
              </CardText>
            </CardBody>
          </Card>
          {index < entries.length - 1 && <div className="competition-timeline-arrow"></div>}
        </Col>
      ))}
    </Row>
  </section>
);

export default CompetitionTimeline;
