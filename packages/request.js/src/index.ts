import { endpoint } from "#endpoint.js/pkg";
import { getUserAgent } from "universal-user-agent";

import { VERSION } from "./version.js";
import withDefaults from "./with-defaults.js";

export const request = withDefaults(endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION} ${getUserAgent()}`,
  },
});
