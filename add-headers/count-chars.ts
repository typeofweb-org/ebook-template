import * as Fs from "fs";
import * as Path from "path";
import { promisify } from "util";
import Bluebird from "bluebird";

const CHAPTERS_DIR = Path.join("..", "chapters");

const readdirAsync = promisify(Fs.readdir);
const readFileAsync = promisify(Fs.readFile);
const writeFileAsync = promisify(Fs.writeFile);

export const run = async () => {
  const files = await readdirAsync(CHAPTERS_DIR);

  const mdFilePaths = files
    .filter((f) => !f.startsWith(".") && f.endsWith(".md"))
    .map((f) => Path.join(CHAPTERS_DIR, f));

  return Bluebird.map(mdFilePaths, async (path) => {
    console.log(`Processing ${path}.`);
    return {
      text: await readFileAsync(path, "utf-8"),
      path: path,
    };
  })
  .map(({ text, path }) => {
    const textWithoutHeaders = text
      .split("\n")
      .filter((line) => !line.startsWith("#"))
      .join("\n");
    return {
      text: textWithoutHeaders.replace(
        /^```(ts|js|bash|)\n([\s\S]+?)\n```$/gm,
        ""
      ).replace(/[@#$%^&~*()/?_`]/g, '').replace(/\s+/, ' '),
      path,
    };
  })
  .mapSeries(({text, path}) => {
    console.log(path.replace('../chapters/', '').padStart(43, ' '), text.length);
    return {text, path};
  }).reduce((acc, {text}) => {
    return acc + text.length;
  }, 0).tap(total => console.log(`Total: ${total}`));
};

run();
