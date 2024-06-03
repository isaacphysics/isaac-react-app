import React from "react";
import { Button, Col, Container, Row } from "reactstrap";
import { selectors, useAppSelector } from "../../state";
import { isStudent } from "../../services";
import careerVideos from "../../assets/career_videos.json";
import { Link } from "react-router-dom";

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

const videoId = careerVideos[0].video;

export const CareersBanner = () => {
  const user = useAppSelector(selectors.user.orNull);
  return (
    <Container className="d-flex align-items-center flex-column">
      <h4 className="career-title">Careers in Computer Science</h4>
      <Row className="career reversed">
        <Col xs={12} sm={6} className="video-column">
          <iframe
            title="career-video"
            className="no-border mh-100"
            id="ytplayer"
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&fs=1&modestbranding=1`}
            allowFullScreen
          />
        </Col>
        <Col className="video-description-column">
          <h4>{isStudent(user) ? "Linking computer science to the real world" : "Computer Science at work"}</h4>
          <CsAtWorkDescription />
          <Button tag={Link} size="lg" className="mt-2" to={"/careers_in_computer_science"}>
            See more careers videos
          </Button>
        </Col>
      </Row>
      <Row className="cs-journey">
        <Col xs="auto" className="left-column">
          <h4>
            <a href="/pages/computer_science_journeys_gallery" rel="noopener noreferrer">
              Computer Science Journeys
            </a>
          </h4>
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
