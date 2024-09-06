declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'mini-css-extract-plugin' {
  const classes: { [key: string]: string };
  export default 1;
}
