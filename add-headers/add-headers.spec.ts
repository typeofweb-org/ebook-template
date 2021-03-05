import { generateIdFromLine, addIdToLine } from "./add-headers";
import {
  stringToParams,
  paramsToString,
  Params
} from "./add-headers";
describe("params", () => {
  const tests: Array<{
    string: string | null;
    params: Params;
  }> = [
    {
      string:
        "{epub:type=errata .unnumbered .unlisted}",
      params: {
        "epub:type": "errata",
        ".unnumbered": true,
        ".unlisted": true
      }
    },
    {
      string: "{epub:type=foreword .unnumbered}",
      params: {
        "epub:type": "foreword",
        ".unnumbered": true
      }
    },
    {
      string: "{epub:type=preface}",
      params: { "epub:type": "preface" }
    },
    {
      string: null,
      params: {}
    },
    {
      string: "{#sec:typowanie-statyczne}",
      params: {
        "#sec:typowanie-statyczne": true
      }
    },
    {
      string: "{#sec:funkcje}",
      params: {
        "#sec:funkcje": true
      }
    },
    {
      string: "{#sec:assertUnreachable}",
      params: {
        "#sec:assertUnreachable": true
      }
    }
  ];

  describe("stringToParams", () => {
    tests.forEach(test => {
      it(`${test.string} into ${JSON.stringify(
        test.params
      )}`, () => {
        expect(stringToParams(test.string)).toEqual(
          test.params
        );
      });
    });
  });

  describe("paramsToString", () => {
    tests.forEach(test => {
      it(`${JSON.stringify(test.params)} into ${
        test.string
      }`, () => {
        expect(paramsToString(test.params)).toEqual(
          test.string
        );
      });
    });
  });

  describe("generateIdFromLine", () => {
    const tests = [
      {
        in: "# Typy nominalne {#sec:typy-nominalne}",
        out: "typy-nominalne"
      },
      {
        in: "## Biblioteki do walidacji",
        out: "biblioteki-do-walidacji"
      },
      {
        in: "## Zażółć gęślą jaŹń {.unlisted}",
        out: "zazolc-gesla-jazn"
      },
      {
        in: `## Funkcja !@#$%^&,.*\`\\§£'()*_{}:"<>|?! zażółć`,
        out: `funkcja-_-zazolc`,
      }
    ];

    tests.forEach(t => {
      it(`${t.in}`, () => {
        expect(generateIdFromLine(t.in)).toEqual(
          t.out
        );
      });
    });
  });

  describe("addIdToLine", () => {
    const tests = [
      {
        in: "## Typ Object.keys() jest niepoprawny",
        out: "## Typ Object.keys() jest niepoprawny"
      },
      {
        in:
          "## Wszystkie elementy tablicy są zażółćgęśląjaźń",
        out:
          "## Wszystkie elementy tablicy są zażółćgęśląjaźń {#sec:wszystkie-elementy-tablicy-sa-zazolcgeslajazn}"
      },
      {
        in:
          "# Unie w praktyce {#sec:unie-w-praktyce}",
        out:
          "# Unie w praktyce {#sec:unie-w-praktyce}"
      },
      {
        in:
          "### Otagowana unia i _pattern matching_",
        out:
          "### Otagowana unia i _pattern matching_"
      },
      {
        in:
          "# Errata {epub:type=errata .unnumbered .unlisted}",
        out:
          "# Errata {epub:type=errata .unnumbered .unlisted}"
      },
      {
        in:
          "# Unie w zażółćgęśląjaźń {#sec:unie-w-praktyce}",
        out:
          "# Unie w zażółćgęśląjaźń {#sec:unie-w-praktyce}"
      },
      {
        in: '## Funkcja przyjmuje obiekty, 22 które mają więcej pól, niż powinny?',
        out: '## Funkcja przyjmuje obiekty, 22 które mają więcej pól, niż powinny? {#sec:funkcja-przyjmuje-obiekty-22-ktore-maja-wiecej-pol-niz-powinny}'
      },
      {
        in: `## Funkcja !@#$%^&*\`\\§£,./'()*_{}:"<>|?! zażółć`,
        out: `## Funkcja !@#$%^&*\`\\§£,./'()*_{}:"<>|?! zażółć {#sec:funkcja-_-zazolc}`,
      },
      {
        in: '## Domyślna wartość parametrów',
        out: '## Domyślna wartość parametrów {#sec:domyslna-wartosc-parametrow}'
      }
    ];

    tests.forEach(t => {
      it(`${t.in}`, () => {
        expect(addIdToLine(t.in)).toEqual(t.out);
      });
    });
  });
});
