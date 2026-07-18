import path from "node:path";

import { types } from "@babel/core";
import type { NodePath, PluginObj, PluginPass } from "@babel/core";

const SOURCE_MARKER_ATTRIBUTE = "data-lumaveno-source-id";
const RUNTIME_ANCHOR_ATTRIBUTE = "data-source";
const SOURCE_ID_PATTERN = /^lv_[A-Za-z0-9_-]{20,64}$/;
const JSX_MODULE_PATTERN = /\.(?:jsx|tsx)$/i;

interface SourceAnchorPluginOptions {
  projectRoot: string;
  emitRuntimeAnchor: boolean;
}

type SourceAnchorPluginPass = PluginPass & {
  opts: SourceAnchorPluginOptions;
};

type JSXOpeningElement = ReturnType<typeof types.jsxOpeningElement>;
type JSXOpeningElementPath = NodePath<JSXOpeningElement>;

interface OpeningElementMutation {
  path: JSXOpeningElementPath;
  originalAttributes: JSXOpeningElement["attributes"];
  replacementAttributes: JSXOpeningElement["attributes"];
  candidateId: string | null;
  hasExplicitDataSource: boolean;
}

function isNamedAttribute(
  attribute: JSXOpeningElement["attributes"][number],
  name: string
) {
  return (
    types.isJSXAttribute(attribute) &&
    types.isJSXIdentifier(attribute.name, { name })
  );
}

function validSourceId(
  attribute: JSXOpeningElement["attributes"][number]
): string | null {
  if (
    !types.isJSXAttribute(attribute) ||
    !types.isStringLiteral(attribute.value) ||
    !SOURCE_ID_PATTERN.test(attribute.value.value)
  ) {
    return null;
  }

  return attribute.value.value;
}

function isIntrinsicElement(openingElement: JSXOpeningElement): boolean {
  return (
    types.isJSXIdentifier(openingElement.name) &&
    /^[a-z]/.test(openingElement.name.name)
  );
}

function resolveProjectFilePath(
  options: SourceAnchorPluginOptions,
  filename: string | null | undefined
): string {
  if (
    typeof options.projectRoot !== "string" ||
    options.projectRoot.length === 0 ||
    typeof options.emitRuntimeAnchor !== "boolean" ||
    typeof filename !== "string" ||
    filename.length === 0 ||
    filename.includes("\0")
  ) {
    throw new Error("Invalid source-anchor transform context");
  }

  const projectRoot = path.resolve(options.projectRoot);
  const absoluteFilename = path.isAbsolute(filename)
    ? path.resolve(filename)
    : path.resolve(projectRoot, filename);
  const relativePath = path.relative(projectRoot, absoluteFilename);
  const pathSegments = relativePath.split(path.sep);

  if (
    relativePath.length === 0 ||
    path.isAbsolute(relativePath) ||
    pathSegments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment === "node_modules"
    )
  ) {
    throw new Error("Source module is outside the generated project");
  }

  const posixPath = pathSegments.join("/");
  if (posixPath.includes("\\") || !JSX_MODULE_PATTERN.test(posixPath)) {
    throw new Error("Source module is not an eligible JSX file");
  }

  return posixPath;
}

function collectMutations(
  programPath: NodePath,
  runtimePath: string,
  emitRuntimeAnchor: boolean
): OpeningElementMutation[] {
  const mutations: OpeningElementMutation[] = [];
  const sourceIdCounts = new Map<string, number>();

  programPath.traverse({
    JSXOpeningElement(openingPath: JSXOpeningElementPath) {
      const originalAttributes = openingPath.node.attributes;
      const markerAttributes = originalAttributes.filter((attribute) =>
        isNamedAttribute(attribute, SOURCE_MARKER_ATTRIBUTE)
      );

      if (markerAttributes.length === 0) {
        return;
      }

      for (const markerAttribute of markerAttributes) {
        const sourceId = validSourceId(markerAttribute);
        if (sourceId !== null) {
          sourceIdCounts.set(sourceId, (sourceIdCounts.get(sourceId) ?? 0) + 1);
        }
      }

      const candidateId =
        isIntrinsicElement(openingPath.node) && markerAttributes.length === 1
          ? validSourceId(markerAttributes[0])
          : null;

      mutations.push({
        path: openingPath,
        originalAttributes,
        replacementAttributes: originalAttributes.filter(
          (attribute) => !isNamedAttribute(attribute, SOURCE_MARKER_ATTRIBUTE)
        ),
        candidateId,
        hasExplicitDataSource: originalAttributes.some((attribute) =>
          isNamedAttribute(attribute, RUNTIME_ANCHOR_ATTRIBUTE)
        ),
      });
    },
  });

  for (const mutation of mutations) {
    if (
      emitRuntimeAnchor &&
      mutation.candidateId !== null &&
      sourceIdCounts.get(mutation.candidateId) === 1 &&
      !mutation.hasExplicitDataSource
    ) {
      mutation.replacementAttributes.push(
        types.jsxAttribute(
          types.jsxIdentifier(RUNTIME_ANCHOR_ATTRIBUTE),
          types.stringLiteral(
            `lv1:${encodeURIComponent(runtimePath)}:${mutation.candidateId}`
          )
        )
      );
    }
  }

  return mutations;
}

function applyMutations(mutations: OpeningElementMutation[]): void {
  try {
    for (const mutation of mutations) {
      mutation.path.node.attributes = mutation.replacementAttributes;
    }
  } catch {
    for (const mutation of mutations) {
      mutation.path.node.attributes = mutation.originalAttributes;
    }
  }
}

export default function lumavenoSourceAnchorBabelPlugin(): PluginObj<SourceAnchorPluginPass> {
  return {
    name: "lumaveno-source-anchor",
    visitor: {
      Program(programPath, state) {
        try {
          const runtimePath = resolveProjectFilePath(
            state.opts,
            state.file.opts.filename
          );
          const mutations = collectMutations(
            programPath,
            runtimePath,
            state.opts.emitRuntimeAnchor
          );
          applyMutations(mutations);
        } catch {
          // Source anchors are optional metadata and must never break compilation.
        }
      },
    },
  };
}
