import path from "node:path";

// eslint-disable-next-line import/no-unresolved -- Bun provides this test module.
import { describe, expect, it } from "bun:test";
import { transformSync } from "@babel/core";

import lumavenoSourceAnchorBabelPlugin from "./source-anchor-babel-plugin";

const PROJECT_ROOT = path.resolve("/workspace/generated-app");
const ELEMENT_ID = "lv_0123456789abcdef0123456789abcdef";
const SOURCE_MARKER = `data-lumaveno-source-id="${ELEMENT_ID}"`;

interface TransformOptions {
  projectRoot: string;
  emitRuntimeAnchor: boolean;
}

function transform(
  source: string,
  options: TransformOptions,
  filename = path.join(PROJECT_ROOT, "src/App.tsx")
): string {
  const result = transformSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    parserOpts: {
      plugins: ["jsx", "typescript"],
    },
    plugins: [[lumavenoSourceAnchorBabelPlugin, options]],
  });

  if (result?.code === undefined || result.code === null) {
    throw new Error("Babel did not return transformed source");
  }

  return result.code;
}

describe("lumavenoSourceAnchorBabelPlugin", () => {
  it("replaces a valid marker with an encoded runtime anchor during serve", () => {
    const output = transform(
      `export const App = () => <button ${SOURCE_MARKER}>Buy</button>;`,
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: true },
      path.join(PROJECT_ROOT, "src/components/My Button.tsx")
    );

    expect(output).toBe(
      `export const App = () => <button data-source="lv1:src%2Fcomponents%2FMy%20Button.tsx:${ELEMENT_ID}">Buy</button>;`
    );
    expect(output).not.toContain("data-lumaveno-source-id");
  });

  it("strips the source marker without emitting an anchor during build", () => {
    const output = transform(
      `export const App = () => <button ${SOURCE_MARKER}>Buy</button>;`,
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: false }
    );

    expect(output).toBe(
      "export const App = () => <button>Buy</button>;"
    );
    expect(output).not.toContain("data-lumaveno-source-id");
    expect(output).not.toContain("data-source");
    expect(output).not.toContain("src%2FApp.tsx");
  });

  it("appends the runtime anchor after every JSX spread", () => {
    const output = transform(
      `export const App = (props: object) => <button before="yes" {...props} ${SOURCE_MARKER} after="yes" />;`,
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: true }
    );

    const spreadIndex = output.indexOf("{...props}");
    const anchorIndex = output.indexOf("data-source=");
    const closingIndex = output.indexOf(" />");

    expect(spreadIndex).toBeGreaterThan(-1);
    expect(anchorIndex).toBeGreaterThan(spreadIndex);
    expect(closingIndex).toBeGreaterThan(anchorIndex);
    expect(output.slice(anchorIndex, closingIndex)).toBe(
      `data-source="lv1:src%2FApp.tsx:${ELEMENT_ID}"`
    );
  });

  it("preserves an explicit user-authored data-source", () => {
    const output = transform(
      `export const App = () => <div ${SOURCE_MARKER} data-source="user-value" />;`,
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: true }
    );

    expect(output).toBe(
      `export const App = () => <div data-source="user-value" />;`
    );
    expect(output).not.toContain("lv1:");
    expect(output).not.toContain("data-lumaveno-source-id");
  });

  it("does not emit anchors for malformed, duplicate, or component markers", () => {
    const output = transform(
      `export const App = () => <><div ${SOURCE_MARKER} /><span ${SOURCE_MARKER} /><Widget data-lumaveno-source-id="lv_abcdefghijklmnopqrstuvwxyz" /><i data-lumaveno-source-id="bad" /></>;`,
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: true }
    );

    expect(output).not.toContain("data-source");
    expect(output).not.toContain("data-lumaveno-source-id");
  });

  it("leaves the module unchanged when its transform context throws", () => {
    const options = new Proxy<TransformOptions>(
      { projectRoot: PROJECT_ROOT, emitRuntimeAnchor: true },
      {
        get() {
          throw new Error("simulated transform failure");
        },
      }
    );

    const output = transform(
      `export const App = () => <button ${SOURCE_MARKER}>Buy</button>;`,
      options
    );

    expect(output).toBe(
      `export const App = () => <button ${SOURCE_MARKER}>Buy</button>;`
    );
    expect(output).not.toContain("data-source");
  });
});
