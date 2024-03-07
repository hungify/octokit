import { readdir, mkdir, rm, writeFile, copyFile } from "node:fs/promises";
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
  const files = await readdir(new URL("../open-api", import.meta.url));
  for (const fileName of files) {
    if (!/\.json$/.test(fileName)) continue;

    const name = basename(fileName, ".json");

    const packageName =
      name === "api.github.com" ? "openapi-types" : `openapi-types-${name}`;

    const packageDir = `${import.meta.dir}/${packageName}`

    await mkdir(packageDir, { recursive: true });
    await writeFile(
      `${packageDir}/package.json`,
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
        { parser: "json-stringify" },
      ),
    );
    await writeFile(
      `${packageDir}/README.md`,
      await prettier.format(
        `
# @octokit/${packageName}

> Generated TypeScript definitions based on GitHub's OpenAPI spec ${packageName === "openapi-types" ? "" : `for ${name}`
        }

This package is continuously updated based on [GitHub's OpenAPI specification](https://github.com/github/rest-api-description/)

## Usage

\`\`\`ts
import { components } from "@octokit/${packageName}";

type Repository = components["schemas"]["full-repository"]
\`\`\`

## License

[MIT](LICENSE)
`,
        { parser: "markdown" },
      ),
    );
    const openApiSpec = new URL(`../open-api/${name}.json`, import.meta.url)
    await writeFile(
      `${packageDir}/schema.d.ts`,
      await prettier.format(await openapiTS(openApiSpec), {
        parser: "typescript",
      }),
    );
    console.log(`${packageName}/schema.d.ts written`);
  }
}
