import { format } from "prettier";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const generateEndpoints = async () => {
  const jsonFilePath = resolve(
    rootDir,
    "../openapi-types.ts/cache/api.github.com.deref.json"
  );

  const contents = JSON.parse(readFileSync(jsonFilePath, "utf-8"));

  if (contents) {
    const endpoints = [];

    // Iterate over the paths in the JSON file
    for (const path in contents.paths) {
      const methods = contents.paths[path];

      for (const method in methods) {
        const details = methods[method];

        const parameters =
          details.parameters?.map((param) => ({
            alias: param.alias || null,
            deprecated: param.deprecated || null,
            in: param.in.toUpperCase(),
            name: param.name,
          })) || [];

        const body = [];
        if (details.requestBody) {
          const schema =
            details.requestBody?.content?.["application/json"]?.schema;
          if (schema?.type === "object") {
            Object.entries(
              details.requestBody?.content?.["application/json"]?.schema
                ?.properties
            ).forEach(([key]) => {
              body.push({
                alias: null,
                deprecated: null,
                in: "BODY",
                name: key,
              });
            });
          }
        }

        const entry = {
          method: method.toUpperCase(),
          url: path,
          documentationUrl: details.externalDocs?.url,
          parameters: [...parameters, ...body],
          renamed: details["x-octokit"]?.renamed || null,
        };

        endpoints.push(entry);
      }
    }
    const formattedEndpoints = await format(JSON.stringify(endpoints), {
      parser: "json",
    });

    const outputPath = "generated/endpoints.json";

    writeFileSync(resolve(__dirname, outputPath), formattedEndpoints);

    console.log(`Endpoints written to ${outputPath}`);
  }
};

generateEndpoints();
