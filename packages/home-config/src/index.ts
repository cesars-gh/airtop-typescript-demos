export enum EXAMPLES_DIRS {
  LINKEDIN_DATA_EXTRACTION = "linkedin-data-extraction",
}

export const registerToHome = (exampleName: EXAMPLES_DIRS) => {
  return {
    assetPrefix: `/${exampleName}-static`,
  };
};

export const getHomeConfig = (exampleName: EXAMPLES_DIRS) => {
  const url = `https://${exampleName}.examples.airtop.ai`;

  return [
    {
      source: `/${exampleName}`,
      destination: `${url}/${exampleName}`,
    },
    {
      source: `/${exampleName}/:path*`,
      destination: `${url}/${exampleName}/:path*`,
    },
    {
      source: `/${exampleName}-static/:path*`,
      destination: `${url}/:path*`,
    },
  ];
};
