export function generatePitchVariants(input: {
  product: string;
  audience: string;
  problem: string;
  whyNow: string;
  solution: string;
  proof: string;
  differentiation: string;
  commercialModel: string;
  caseStudy: string;
  ask: string;
  timeLimit: 30 | 60 | 120 | 300 | 600;
}) {
  const base = `${input.product} for ${input.audience} solves ${input.problem}. ${input.whyNow} ${input.solution}. ${input.proof}. ${input.differentiation}. ${input.ask}`;

  return {
    elevator30: `In 30 seconds: ${input.product} helps ${input.audience} solve ${input.problem}. ${input.solution}. ${input.ask}`,
    concise60: `In 60 seconds: ${base}`,
    structured2m: `2-minute pitch: Context - ${input.whyNow}. Problem - ${input.problem}. Solution - ${input.solution}. Proof - ${input.proof}. Model - ${input.commercialModel}. Ask - ${input.ask}.`,
    detailed5m: `5-minute pitch: Audience ${input.audience}. Pain ${input.problem}. Why now ${input.whyNow}. Differentiation ${input.differentiation}. Case study ${input.caseStudy}. Commercial model ${input.commercialModel}. Ask ${input.ask}.`,
    objectionBank: ["Your price is too high", "We already have a vendor", "Send information first", "This is not a priority"],
    likelyQuestions: ["How quickly do we see ROI?", "Who owns implementation?", "What is the risk if results slip?"],
    recommendedDrills: ["Objection: price too high", "Discovery with busy CFO", "Influence without authority"],
    timeLimit: input.timeLimit
  };
}
