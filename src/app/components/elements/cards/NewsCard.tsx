import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardImg, CardText } from "reactstrap";
import { IsaacPodDTO } from "../../../../IsaacApiTypes";
import { apiHelper } from "../../../services";

interface NewsCardProps {
  newsItem: IsaacPodDTO;
  showTitle?: boolean;
  linkText?: string;
}

export const NewsCard = ({ newsItem, showTitle, linkText = "Find out more" }: NewsCardProps) => {
  const { title, value, image, url } = newsItem;

  return (
    <Card data-testid={"news-pod"} className={"news-card custom-card"}>
      {image && (
        <a href={url}>
          <CardImg
            className={"news-card-image"}
            top
            src={image.src && apiHelper.determineImageUrl(image.src)}
            alt={image.altText || `Illustration for ${title}`}
          />
        </a>
      )}
      <CardBody className="d-flex flex-column">
        <div className="m-0 mb-auto">
          <span className="d-block my-2">
            {showTitle ? (
              <div>
                <h3 className="card-title">{title}</h3>
                <p>{value}</p>
              </div>
            ) : (
              <h3 className="card-title">{value}</h3>
            )}
          </span>
        </div>
        <div className="centered-link">
          <CardText>
            {!url?.startsWith("http") ? (
              <Link className="details-button" to={`${url}`}>
                Read more
              </Link>
            ) : (
              <a className="focus-target" href={url} target="_blank" rel="noopener noreferrer">
                {linkText}
              </a>
            )}
          </CardText>
        </div>
      </CardBody>
    </Card>
  );
};
