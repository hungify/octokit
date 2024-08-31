import { request as myRequest } from "#request.js/pkg";
import { request } from "@octokit/request";

const getReposWithMyRequest = async () => {
  const result = await myRequest("GET /orgs/{org}/repos", {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
    org: "octokit",
    type: "public",
  });

  console.log(`${result.data.length} repos found.`);
};

const getReposWithRequest = async () => {
  const result = await request("GET /orgs/{org}/repos", {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
    org: "octokit",
    type: "public",
  });

  console.log(`${result.data.length} repos found.`);
};

getReposWithRequest();
getReposWithMyRequest();
