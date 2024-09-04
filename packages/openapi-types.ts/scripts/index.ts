import { readdir, mkdir, writeFile, exists } from "node:fs/promises";
import { basename } from "node:path";

import * as prettier from "prettier";
import openapiTS from "openapi-typescript";

run();

const packageDefaults = {
  publishConfig: {
    access: "public",
  },
  version: "14.0.0",
  main: "",
  types: "types.d.ts",
  author: "hungify",
  license: "MIT",
  octokit: {
    "openapi-version": "3.0.3",
  },
};

async function run() {
  const files = await readdir("cache");
  for (const fileName of files) {
    if (!/\.json$/.test(fileName)) continue;

    const name = basename(fileName, ".json");

    const packageName = "openapi-types";

    const existsPackageFolder = await exists(`packages/${packageName}`);
    if (!existsPackageFolder) await mkdir(`packages/${packageName}`);

    await writeFile(
      `packages/${packageName}/package.json`,
      await prettier.format(
        JSON.stringify({
          name: `@octokit/${packageName}`,
          description: `Generated TypeScript definitions based on GitHub's OpenAPI spec for ${name}`,
          repository: {
            type: "git",
            url: "https://github.com/octokit/openapi-types.ts.git",
            directory: `packages/${packageName}`,
          },
          ...packageDefaults,
        }),
        { parser: "json-stringify" }
      )
    );
    await writeFile(
      `packages/${packageName}/README.md`,
      await prettier.format(
        `
# @octokit/${packageName}

> Generated TypeScript definitions based on GitHub's OpenAPI spec ${`for ${name}`}

This package is continuously updated based on [GitHub's OpenAPI specification](https://github.com/github/rest-api-description/)

## Usage

\`\`\`ts
import { components } from "@octokit/${packageName}";

type Repository = components["schemas"]["full-repository"]
\`\`\`

## License

[MIT](LICENSE)
`,
        { parser: "markdown" }
      )
    );

    const formattedSchema = await prettier.format(
      await openapiTS(`cache/${name}.json`),
      {
        parser: "typescript",
      }
    );
    await writeFile(`packages/${packageName}/types.d.ts`, formattedSchema);
    console.log(`packages/${packageName}/types.d.ts written`);
  }
}
