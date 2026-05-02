import assert from "node:assert/strict";
import {
  listBreathingProtocols,
  findBreathingProtocol,
  recommendBreathingProtocol
} from "../dist/services/breathing-service.js";

const protocols = listBreathingProtocols();
assert.equal(protocols.length, 6, "expected 6 breathing protocols");

for (const protocol of protocols) {
  assert.equal(typeof protocol.id, "string");
  assert.equal(typeof protocol.title, "string");
  assert.equal(typeof protocol.source, "string");
  assert.equal(typeof protocol.whenToUse, "string");
  assert.equal(typeof protocol.evidenceNote, "string");
  assert.equal(protocol.durationSeconds > 0, true);
  assert.equal(Array.isArray(protocol.steps), true);
  assert.equal(
    protocol.steps.length > 0,
    true,
    `protocol ${protocol.id} should have non-zero step count`
  );
}

assert.equal(findBreathingProtocol("physiological_sigh")?.id, "physiological_sigh");
assert.equal(findBreathingProtocol("not_a_real_id"), undefined);

const anxious = recommendBreathingProtocol({ state: "anxious" });
assert.equal(anxious.id, "physiological_sigh");

const rushed = recommendBreathingProtocol({ state: "rushed" });
assert.equal(rushed.id, "box_breath");

const neutralHighStakes = recommendBreathingProtocol({
  state: "neutral",
  upcomingHighStakes: true
});
assert.equal(neutralHighStakes.id, "pre_speech_calm");

const flat = recommendBreathingProtocol({ state: "flat" });
assert.equal(flat.id, "pre_speech_calm");

const foggy = recommendBreathingProtocol({ state: "foggy" });
assert.equal(foggy.id, "coherent_breathing");

const neutralLowStakes = recommendBreathingProtocol({ state: "neutral" });
assert.equal(neutralLowStakes.id, "rib_expansion");

const defaulted = recommendBreathingProtocol();
assert.equal(typeof defaulted.id, "string");
assert.equal(defaulted.steps.length > 0, true);

console.log("Breathing service tests passed.");
