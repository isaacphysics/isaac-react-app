import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

interface ResourcesProps {
  heading: string;
  description: string;
  links: { to: string; text: string }[];
  tooltip?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Resources = ({ heading, description, links, tooltip, children, className = "" }: ResourcesProps) => {
  return (
    <div className={`resources-background ${className}`}>
      <div className="resources-heading-container">
        <p className="resources-sub-heading">{heading}</p>
        {tooltip && <div className="resources-tooltip-container">{tooltip}</div>}
      </div>
      <p className="resources-text-description">{description}</p>
      <div className="resources-center-container">
        {links.map((link) => (
          <Link key={link.to} className="resources-links" to={link.to}>
            {link.text}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
};

Resources.propTypes = {
  heading: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ).isRequired,
  tooltip: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Resources;
