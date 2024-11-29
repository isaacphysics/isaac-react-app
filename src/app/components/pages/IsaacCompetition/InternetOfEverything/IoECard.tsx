import React from "react";
import { Card, CardTitle, CardBody, CardText } from "reactstrap";

interface IoECardProps {
  title: string;
  content: string[];
  isList?: boolean;
}

const IoECard = ({ title, content, isList = false }: IoECardProps) => (
  <Card className="h-100">
    <CardTitle tag="h3" className="ioe-title pt-4 px-4">
      {title}
    </CardTitle>
    <CardBody>
      {isList ? (
        <ul>
          {content.map((text, index) => (
            <CardText key={`${text}-${index}`} tag="li" className="ioe-text">
              {text}
            </CardText>
          ))}
        </ul>
      ) : (
        content.map((text, index) => (
          <CardText key={`${text}-${index}`} className="ioe-text">
            {text}
          </CardText>
        ))
      )}
    </CardBody>
  </Card>
);

export default IoECard;
