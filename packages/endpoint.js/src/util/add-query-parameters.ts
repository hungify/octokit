export function addQueryParameters(
  url: string,
  parameters: { [x: string]: string | undefined; q?: string },
) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return (
    url +
    separator +
    names
      .map((name) => {
        if (name === "q") {
          return (
            "q=" + parameters.q!.split("+").map(encodeURIComponent).join("+")
          );
        }

        return `${name}=${encodeURIComponent(parameters[name]!)}`;
      })
      .join("&")
  );
}
