interface GetErrorOptions<T> {
  error?: Error;
  message: keyof T;
}

// from myu-utils
function taggedString(chains: TemplateStringsArray, ...expectedValues: string[] | number[]) {
  return function cur(...args: any[]): string {
    const directory = args.at(-1) || {};
    const result = [chains[0]];
    expectedValues.forEach((key: string | number, index: number) => {
      result.push(
        typeof key === "number" ? args[key] : directory[key],
        chains[index + 1]
      );
    });

    return result.join("");
  };
}

const kFetchBodyErrors = {
  ResponseFetchError: taggedString`An unexpected error occurred while trying to retrieve the response body (reason: '${0}').`
};

const kDecompressionErrors = {
  // eslint-disable-next-line @stylistic/max-len
  UnexpectedDecompressionError: taggedString`An unexpected error occurred when trying to decompress the response body (reason: '${0}').`,
  DecompressionNotSupported: taggedString`Unsupported encoding '${0}'.`
};

const kParserErrors = {
  ResponseParsingError: taggedString`An unexpected error occurred when trying to parse the response body (reason: '${0}').`
};

function getErrorsByType<T extends Record<string, string | ReturnType<typeof taggedString>>>(errorDirectory: T) {
  return (options: GetErrorOptions<T>, ...args: string[]) => {
    const { error, message: errorLabel } = options;
    const err = errorDirectory[errorLabel];

    if (typeof err === "string") {
      return err;
    }

    return err(...(args.length === 0 ? [error?.message] : args));
  };
}

export const getFetchError = getErrorsByType(kFetchBodyErrors);
export const getDecompressionError = getErrorsByType(kDecompressionErrors);
export const getParserError = getErrorsByType(kParserErrors);

