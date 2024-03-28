import React from "react";
import { Col, Container, Row } from "reactstrap";
import { selectors, useAppSelector } from "../../state";
import { CAREER_VIDEO_LINK, isStudent } from "../../services";

const CsAtWorkDescription = () => {
  const user = useAppSelector(selectors.user.orNull);
  const loggedOutDescription =
    "Better understand computer science curriculum topics by connecting them to the real world of work with our new video resources. Watch a Computing Ambassador introduce a topic and share what they do in their day-to-day job.";
  const student =
    "Wondering how studying computer science can help you in your future job or where would you ever use this knowledge? Our new video resources are here to show you the real-world application of your learning. Watch a Computing Ambassador introduce a topic and share what they do in their day-to-day job.";
  const teacherOrAbove =
    "Looking at how to connect your students' learning of computer science and the real world of work? Our new video resources are here to help you bring the curriculum topics to life with Computing Ambassadors introducing topics and sharing what they do in their day-to-day job.";

  const roleSpecificDescription = isStudent(user) ? student : teacherOrAbove;

  return <p className="mb-3">{!user?.loggedIn ? loggedOutDescription : roleSpecificDescription}</p>;
};

export const Careers = () => {
  const user = useAppSelector(selectors.user.orNull);
  return (
    <Container className="d-flex align-items-center flex-column">
      <button className="btn-lg">Careers in Computer Science</button>
      <Row className="at-work">
        <Col xs={12} sm={6} className="left-column">
          <iframe
            title="career-video"
            className="no-border mh-100"
            id="ytplayer"
            width="100%"
            height="100%"
            src={CAREER_VIDEO_LINK}
            allowFullScreen
          />
        </Col>
        <Col className="right-column">
          <h5>
            <strong>
              {isStudent(user) ? "Linking computer science to the real world" : "Computer Science at work"}
            </strong>
          </h5>
          <CsAtWorkDescription />
        </Col>
      </Row>
      <Row className="cs-journey">
        <Col xs="auto" className="left-column">
          <h5>
            <a href="/pages/computer_science_journeys_gallery" rel="noopener noreferrer">
              <strong>Computer Science Journeys</strong>
            </a>
          </h5>
          <p className="mb-3">
            Discover our monthly interview series and learn from passionate educators within the Isaac community, and
            recently-graduated computer scientists who are doing AMAZING things in a huge range of computing-related
            fields!
          </p>
        </Col>
        <Col xs="auto" className="right-column">
          <img src="/assets/cs_journeys.png" alt="cs journeys" />
        </Col>
      </Row>
    </Container>
  );
};
