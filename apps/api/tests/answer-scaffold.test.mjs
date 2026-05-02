import assert from "node:assert/strict";
import {
  evaluateScaffoldFill,
  findScaffoldFramework,
  listScaffoldFrameworks
} from "../dist/services/answer-scaffold-service.js";

const frameworks = listScaffoldFrameworks();
assert.equal(frameworks.length, 6, "Expected 6 scaffold frameworks");
const ids = frameworks.map((framework) => framework.id).sort();
assert.deepEqual(
  ids,
  ["BLUF", "CAR", "PREP", "PYRAMID", "SCQA", "STAR"],
  "Expected the six canonical framework ids"
);

const star = findScaffoldFramework("STAR");
assert.ok(star, "Expected STAR framework to exist");
assert.equal(star.id, "STAR");
assert.equal(star.segments.length, 4, "Expected STAR to have 4 segments");
assert.deepEqual(
  star.segments.map((segment) => segment.key),
  ["s", "t", "a", "r"],
  "Expected STAR segment keys s/t/a/r"
);
assert.deepEqual(
  star.segments.map((segment) => segment.maxWords),
  [25, 15, 40, 25],
  "Expected STAR maxWords 25/15/40/25"
);

const missing = findScaffoldFramework("DOES_NOT_EXIST");
assert.equal(missing, undefined, "Unknown id should return undefined");

const emptyResult = evaluateScaffoldFill({
  frameworkId: "STAR",
  segments: { s: "", t: "   ", a: "", r: "" }
});
assert.equal(emptyResult.ok, false, "Empty fill should not be ok");
assert.equal(emptyResult.totalWords, 0, "Empty fill total words should be 0");
assert.equal(emptyResult.perSegment.length, 4, "STAR evaluation should expose 4 segments");
assert.ok(
  emptyResult.perSegment.every((segment) => segment.missing === true),
  "All STAR segments should be flagged missing when empty"
);
assert.ok(
  emptyResult.globalNote.toLowerCase().includes("trim"),
  "globalNote should advise trimming/completing when not ok"
);

const validFill = evaluateScaffoldFill({
  frameworkId: "STAR",
  segments: {
    s: "Last quarter our checkout team faced a sharp drop on mobile devices.",
    t: "I owned cutting that drop-off in half.",
    a: "I ran a session-replay audit, prioritized three friction points, partnered with design on a one-tap flow, and shipped daily A/B tests.",
    r: "Drop-off fell from twelve percent to five percent within three weeks."
  }
});
assert.equal(validFill.ok, true, "Valid STAR fill should be ok");
assert.ok(validFill.assembled.length > 0, "Assembled answer should be non-empty");
assert.ok(/\.$/.test(validFill.assembled), "Assembled answer should be period-terminated");
assert.ok(
  validFill.perSegment.every((segment) => segment.missing === false && segment.overLimit === false),
  "No segment should be missing or overLimit when valid"
);
assert.ok(
  validFill.globalNote.toLowerCase().includes("solid"),
  "globalNote should celebrate when scaffold is ok"
);

const tooLongAction = Array.from({ length: 60 }, (_, index) => `word${index + 1}`).join(" ");
const overLimitFill = evaluateScaffoldFill({
  frameworkId: "STAR",
  segments: {
    s: "Last quarter our checkout team faced a sharp drop on mobile devices.",
    t: "I owned cutting that drop-off in half.",
    a: tooLongAction,
    r: "Drop-off fell from twelve percent to five percent within three weeks."
  }
});
assert.equal(overLimitFill.ok, false, "Over-limit fill should not be ok");
const actionSegment = overLimitFill.perSegment.find((segment) => segment.key === "a");
assert.ok(actionSegment, "Action segment should be present in evaluation");
assert.equal(actionSegment.overLimit, true, "Action segment should be flagged overLimit");
assert.equal(actionSegment.missing, false, "Over-limit segment should not also be missing");
assert.ok(
  actionSegment.note.includes(String(actionSegment.maxWords)),
  "Over-limit note should reference the maxWords cap"
);

console.log("Answer scaffold tests passed.");
