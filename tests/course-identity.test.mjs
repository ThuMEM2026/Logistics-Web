import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("entry page presents the approved course identity", async () => {
  const source = await readSource("src/routes/index.tsx");

  assert.match(source, /智慧物流系统设计/);
  assert.match(source, /Facilities Planning & Material Handling/);
  assert.match(source, /Wafia Bakery/);
  assert.match(source, /学生入口/);
  assert.doesNotMatch(source, /从 Week 8 开始尝试/);
});

test("student calendar exposes a task-first Week 8 entry", async () => {
  const source = await readSource("src/routes/student.index.tsx");

  assert.match(source, /开始尝试/);
  assert.match(source, /\/student\/week\/\$weekId/);
});

test("Week 8 and the assistant make the learning loop explicit", async () => {
  const [weekSource, assistantSource] = await Promise.all([
    readSource("src/routes/student.week.$weekId.tsx"),
    readSource("src/routes/student.assistant.tsx"),
  ]);

  assert.match(weekSource, /初次尝试/);
  assert.match(weekSource, /把问题问清楚/);
  assert.match(assistantSource, /不直接代做/);
});

test("shared shell keeps the approved brand and a single-row mobile navigation", async () => {
  const source = await readSource("src/components/AppShell.tsx");

  assert.match(source, /智慧物流系统设计/);
  assert.match(source, /overflow-x-auto/);
});

test("submission, report, and teacher view foreground the evidence loop", async () => {
  const [submitSource, resultSource, teacherSource] = await Promise.all([
    readSource("src/routes/student.submit.tsx"),
    readSource("src/routes/student.result.tsx"),
    readSource("src/routes/teacher.index.tsx"),
  ]);

  assert.match(submitSource, /提交与验证/);
  assert.match(resultSource, /先读结论/);
  assert.match(teacherSource, /过程性证据/);
});
