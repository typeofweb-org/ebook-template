import * as Fs from "fs";
import * as Path from "path";
import { promisify } from "util";
import Bluebird from "bluebird";
import * as Prettier from "prettier";

const CHAPTERS_DIR = Path.join("..", "chapters");

const readdirAsync = promisify(Fs.readdir);
const readFileAsync = promisify(Fs.readFile);
const writeFileAsync = promisify(Fs.writeFile);

const hasID = (params: Params): boolean => {
  return Object.keys(params).some((key) =>
    key.startsWith("#sec:")
  );
};

const REPLACEMENTS: Record<string, string> = {
  ż: "z",
  ó: "o",
  ł: "l",
  ć: "c",
  ę: "e",
  ś: "s",
  ą: "a",
  ź: "z",
  ń: "n",
};
const POLISH_REGEX = new RegExp(
  "[" + Object.keys(REPLACEMENTS).join("") + "]",
  "gi"
);

export const generateIdFromLine = (
  line: string
): string => {
  return line
    .toLocaleLowerCase()
    .replace(/({.*})$/, "")
    .replace(/^#+ /, "")
    .trim()
    .replace(
      /.{1}/g,
      (val) => REPLACEMENTS[val] || val
    )
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/-+$/, "");
};

export const addIdToLine = (
  line: string
): string => {
  const match = line.match(/ ({.*})$/);
  const params = match
    ? stringToParams(match[1])
    : {};
  if (hasID(params) || !POLISH_REGEX.test(line)) {
    return line;
  } else {
    const id = generateIdFromLine(line);
    params["#sec:" + id] = true;
    return (
      line.replace(/ ({.*})$/, "") +
      " " +
      paramsToString(params)
    );
  }
};

export const run = async () => {
  const files = await readdirAsync(CHAPTERS_DIR);

  const mdFilePaths = files
    .filter(
      (f) => !f.startsWith(".") && f.endsWith(".md")
    )
    .map((f) => Path.join(CHAPTERS_DIR, f));

  Bluebird.map(mdFilePaths, async (path) => {
    console.log(`Processing ${path}.`);
    return {
      text: await readFileAsync(path, "utf-8"),
      path: path,
    };
  })
    .map(({ text, path }) => {
      return {
        text: text
          .split("\n")
          .map((line) => {
            if (!line.startsWith("#")) {
              return line;
            }
            return addIdToLine(line);
          })
          .join("\n"),
        path,
      };
    })
    .map(({ text, path }) => {
      let result = text;
      for (const {
        1: lang,
        2: code,
        index,
      } of text.matchAll(
        /^```(ts|js)\n([\s\S]+?)\n```$/gm
      )) {
        let formatted = code;
        try {
          formatted = Prettier.format(code, {
            parser:
              lang === "ts" ? "typescript" : "babel",
            printWidth: 53,
            tabWidth: 2,
            proseWrap: "preserve",
            trailingComma: "all",
            arrowParens: "always",
            endOfLine: "lf",
          });
        } catch (err) {
          // console.error(err);
        }
        if (
          formatted[formatted.length - 1] === "\n"
        ) {
          formatted = formatted.slice(
            0,
            formatted.length - 1
          );
        }
        result =
          result.slice(0, index) +
          result
            .slice(index)
            .replace(code, formatted);
        formatted.split("\n").forEach((line) => {
          if (line.length > 53) {
            console.log(
              `TOO LONG (${line.length}): ${line}`
            );
          }
        });
      }
      for (const { 1: code, index } of text.matchAll(
        /^```\w{0,4}\n([\s\S]+?)\n```$/gm
      )) {
        code.split("\n").forEach((line) => {
          if (line.length > 53) {
            console.log(
              `TOO LONG (${line.length}): ${line}`
            );
          }
        });
      }
      return { text: result, path };
    })
    .map(({ text, path }) => {
      return writeFileAsync(path, text, "utf-8");
    });
};

export type Params = Record<string, string | true>;

export function stringToParams(
  params: string | null
): Params {
  if (!params) {
    return {};
  }

  return params
    .slice(1, -1)
    .split(" ")
    .map((param) => {
      const [key, val = true as const] = param.split(
        "="
      );
      return { [key]: val };
    })
    .reduce((acc, el) => Object.assign(acc, el), {});
}

export function paramsToString(
  params: Params
): string | null {
  if (Object.keys(params).length === 0) {
    return null;
  }

  return (
    "{" +
    Object.entries(params)
      .map(([key, val]) => {
        if (val === true) {
          return key;
        }
        return `${key}=${val}`;
      })
      .join(" ") +
    "}"
  );
}

run()
