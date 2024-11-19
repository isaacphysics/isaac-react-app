import React from "react";
import { Col, Container, Row } from "reactstrap";

interface TestimonialCommentProps {
  imageSrc: string;
  altText: string;
  text: string;
}

const TestimonialComment = ({ imageSrc, altText, text }: TestimonialCommentProps) => (
  <Container className="resources-center-container">
    <Row className="resources-comment">
      <Col className="resources-comment-content d-flex align-items-center">
        <img src={imageSrc} alt={altText} className="star-img" />
        <p className="text-left my-3 mx-3">{text}</p>
      </Col>
    </Row>
  </Container>
);

export default TestimonialComment;
