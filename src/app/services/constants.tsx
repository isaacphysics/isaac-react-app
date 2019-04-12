import Remarkable from "remarkable";

export const API_VERSION: string = process.env.REACT_APP_API_VERSION || 'any';
export const API_PATH: string = "http://localhost:8080/isaac-api/api";
export const MARKDOWN_RENDERER: Remarkable = new Remarkable();
