/**
 * Root ESLint config (drop at repo root as .eslintrc.cjs or extend your existing config).
 * Enforces no cross-workspace relative imports and no importing from another workspace's internal src path.
 */
module.exports = {
  root: true,
  extends: [
    // Keep your existing shared configs here, e.g. require.resolve("./packages/config/eslint-base.cjs")
  ],
  rules: {
    /*
     * Do not import across workspaces using relative paths.
     * Example of BAD from apps/mobile to packages/core: ../../packages/core/src/solver/foo
     * Use the package import instead: @ultimate-sudoko/core
     */
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": [
              "../../packages/*",
              "../../../packages/*",
              "**/../../packages/*",
              "**/../../../packages/*"
            ],
            "message": "Do not import other workspaces via relative paths; use their published package entry point."
          },
          {
            "group": [
              // Block deep imports into another workspace's src. Prefer package entry points.
              "@ultimate-sudoko/*/src/**"
            ],
            "message": "Import from the workspace entry point (index.ts), not its internal src/ path."
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ["packages/**"],
      rules: {
        // Inside a package you may import from its own src/*
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": [
                  // Allow self-deep-imports by negating patterns using 'zones' is complex; instead,
                  // we do not list self-patterns here. Only cross-package deep imports are blocked above.
                ]
              }
            ]
          }
        ]
      }
    }
  ]
};
