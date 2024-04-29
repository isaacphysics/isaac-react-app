import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Link } from "react-router-dom";
import { EventsCarousel } from "../elements/EventsCarousel";
import careerVideos from "../../assets/career_videos.json";

interface CareerPanelProps {
  video: string;
  title: string;
  description: string;
  name: string;
  job: string;
  reversed?: boolean;
}

const CareerPanel = ({ video, title, description, name, job, reversed }: CareerPanelProps) => {
  const videoColumn = (
    <Col xs={12} sm={6} className="video-column">
      <iframe
        title={title}
        className="no-border mh-100"
        width="100%"
        height="100%"
        src={`https://www.youtube-nocookie.com/embed/${video}?enablejsapi=1&fs=1&modestbranding=1`}
        allowFullScreen
      />
    </Col>
  );

  const videoDescriptionColumn = (
    <Col className="video-description-column">
      <h3 style={{ textDecorationLine: "underline" }}>{title}</h3>
      <Row className="mx-0 mt-3 career">
        <Col xs={12} xl={4} className="p-0" data-testid="video-speaker">
          <Row className="flex-nowrap m-0">
            <img height="26px" src="/assets/person.svg" alt="person icon" className="mr-2" />
            <span>{name}</span>
          </Row>
        </Col>
        <Col className="p-0 mt-3 mt-xl-0" data-testid="speaker-role">
          <Row className="flex-nowrap m-0">
            <img height="26px" src="/assets/career.svg" alt="career icon" className="mr-2" />
            <span>{job}</span>
          </Row>
        </Col>
      </Row>
      <p className="mt-3" data-testid="video-description">
        {description}
      </p>
    </Col>
  );

  return (
    <Row className={`mt-5 career${reversed ? " reversed" : ""}`}>
      {reversed ? (
        <>
          {videoDescriptionColumn}
          {videoColumn}
        </>
      ) : (
        <>
          {videoColumn}
          {videoDescriptionColumn}
        </>
      )}
    </Row>
  );
};

export const Careers = () => (
  <Container id="careers-page">
    <TitleAndBreadcrumb currentPageTitle="Careers in Computer Science" />
    <div className="mt-4" />

    <section id="careers" className="d-flex justify-content-center flex-column align-items-center pattern-03-reverse">
      {careerVideos.map(({ video, title, description, name, job, id }) => (
        <CareerPanel
          key={`video-${id}`}
          video={video}
          title={title}
          description={description}
          name={name}
          job={job}
          reversed={id % 2 === 0}
        />
      ))}
    </section>

    <section id="events">
      <Container className="pt-4 pb-5">
        <div className="eventList pt-5 pattern-03">
          <h2 className="h-title text-center mb-4">Events</h2>
          <p className="pt-4 pb-2 event-description text-center col-md-8 offset-md-2">
            {"We offer free online events for students. Visit our "}
            <Link to="/events">Events page</Link>
            {" to see what's happening, and sign up today!"}
          </p>
          <EventsCarousel />
          <Link to="/events">See all Events</Link>
        </div>
      </Container>
    </section>
  </Container>
);
