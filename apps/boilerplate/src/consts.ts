export const LOGIN_URL = "https://www.linkedin.com/login";

export const IS_LOGGED_IN_PROMPT =
  "This browser is open to a page that either display's a user's Linkedin profile or prompts the user to login.  Please give me a JSON response matching the schema below.";

export const IS_LOGGED_IN_OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    isLoggedIn: {
      type: "boolean",
      description: "Use this field to indicate whether the user is logged in.",
    },
    error: {
      type: "string",
      description: "If you cannot fulfill the request, use this field to report the problem.",
    },
  },
};

export const TARGET_URL = "https://www.linkedin.com/in/daniel-motta-901a5728b/";

export const EXTRACT_DATA_PROMPT = `Given the LinkedIn profile URL, extract the following information:
Job Information: Include all past and present job titles, company names, dates of employment, job descriptions, and locations.
Education Information: Gather the school names, degrees obtained, field of study, dates attended, and any listed honors or activities.
Mutual Connections: List mutual connections by their names, current job titles, and the company they work for.`;

export const EXTRACT_DATA_OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    profile_url: "string",
    personal_info: {
      name: "string",
      headline: "string",
      location: "string",
    },
    job_history: [
      {
        title: "string",
        company: "string",
        location: "string",
        start_date: "string (YYYY-MM)",
        end_date: "string (YYYY-MM) or 'Present'",
        description: "string",
      },
    ],
    education: [
      {
        school: "string",
        degree: "string",
        field_of_study: "string",
        start_date: "string (YYYY-MM)",
        end_date: "string (YYYY-MM)",
        honors: ["array of strings"],
        activities: ["array of strings"],
      },
    ],
    mutual_connections: [
      {
        name: "string",
        title: "string",
        company: "string",
      },
    ],
    error: {
      type: "string",
      description: "If you cannot fulfill the request, use this field to report the problem.",
    },
  },
};
