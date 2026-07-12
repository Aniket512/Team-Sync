/// <reference types="react-scripts" />
declare module "*.mp3" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}