/// <reference types="node" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PUBLIC_URL: string;
  }
}

declare module "*.bmp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;

  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

// TODO check if correctly versioned types have been added
declare module "bootstrap";
declare module "math-random-seed";

declare const MathJax: any;
declare const ISAAC_SITE: string;
declare const REACT_APP_API_VERSION_ENV: string;
declare const GOOGLE_RECAPTCHA_SITE_KEY_ENV: string;
declare const ENV_QUIZ_FEATURE_FLAG: boolean;
declare const EDITOR_PREVIEW: boolean;
declare const REACT_APP_STAGING_URL_ENV: string;
declare const REACT_APP_API_PATH_LOCAL_ENV: string;
declare const REACT_APP_EDITOR_ORIGIN_ENV: string;
declare const REACT_APP_GOOGLE_ANALYTICS_ENV: string;
declare const REACT_APP_CODE_EDITOR_BASE_URL_ENV: string;

declare module "inequality-grammar" {
  export const parseMathsExpression: (exp: string) => any[] | ParsingError;
  export const parseBooleanExpression: (exp: string) => any[] | ParsingError;
  export type ParsingError = { error: { offset: number; token: { value: string } }; message: string; stack: string };
}

type Nullable<T> = T | null | undefined;
