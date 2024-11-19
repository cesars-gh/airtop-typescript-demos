export enum EXAMPLES_DIRS {
  LINKEDIN_DATA_EXTRACTION = "linkedin-data-extraction",
}

export const registerToHome = (exampleName: EXAMPLES_DIRS) => {
  return {
    assetPrefix: `/${exampleName}-static`,
  };
};

export const getHomeConfig = (exampleName: EXAMPLES_DIRS) => {
  const url = `https://${exampleName}.examples.airtop.dev`;

  return [
    {
      source: `/${exampleName}`,
      destination: url,
    },
    {
      source: `/${exampleName}/:path*`,
      destination: `${url}/:path*`,
    },
    {
      source: `/${exampleName}-static/:path*`,
      destination: `${url}/${exampleName}-static/:path*`,
    },
  ];
};
