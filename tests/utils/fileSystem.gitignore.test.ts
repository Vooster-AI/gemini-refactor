import fs from "fs-extra";
import os from "os";
import path from "path";
import { buildFileTree } from "../../src/utils/fileSystem";

describe("buildFileTree - .gitignore 제외", () => {
  const tmp = path.join(os.tmpdir(), `gr-gitignore-${Date.now()}`);

  beforeAll(async () => {
    await fs.ensureDir(tmp);
    // .gitignore 설정: dist/, out, secret.env, *.log 제외 (out은 슬래시 없이 디렉터리명)
    await fs.outputFile(
      path.join(tmp, ".gitignore"),
      ["dist/", "out", "secret.env", "*.log"].join("\n")
    );

    await fs.ensureDir(path.join(tmp, "dist"));
    await fs.outputFile(path.join(tmp, "dist", "bundle.js"), "// built");
    await fs.ensureDir(path.join(tmp, "out"));
    await fs.outputFile(path.join(tmp, "out", "result.xml"), "<r/>");
    await fs.outputFile(path.join(tmp, "app.log"), "x");
    await fs.outputFile(path.join(tmp, "secret.env"), "KEY=VALUE");
    await fs.ensureDir(path.join(tmp, "src"));
    await fs.outputFile(path.join(tmp, "src", "index.ts"), "console.log('ok')");
  });

  afterAll(async () => {
    await fs.remove(tmp);
  });

  it(".gitignore에 명시된 경로/패턴은 제외되어야 한다 (RED)", async () => {
    const files = await buildFileTree(tmp);
    expect(files.some((f) => f.includes("dist/bundle.js"))).toBe(false);
    expect(files.some((f) => f.includes("out/result.xml"))).toBe(false);
    expect(files.some((f) => f.endsWith("app.log"))).toBe(false);
    expect(files.some((f) => f.endsWith("secret.env"))).toBe(false);
    expect(files.some((f) => f.endsWith("src/index.ts"))).toBe(true);
  });
});


