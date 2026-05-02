export type ScaffoldFrameworkId = 'STAR' | 'CAR' | 'PREP' | 'SCQA' | 'BLUF' | 'PYRAMID';

export type ScaffoldSegment = {
  key: string;
  label: string;
  prompt: string;
  maxWords: number;
  exampleFill: string;
};

export type ScaffoldFramework = {
  id: ScaffoldFrameworkId;
  name: string;
  bestFor: string[];
  description: string;
  segments: ScaffoldSegment[];
  totalWordTarget: number;
  closingHint: string;
};

export type ScaffoldFill = {
  frameworkId: ScaffoldFrameworkId;
  segments: Record<string, string>;
};

export type ScaffoldEvaluation = {
  ok: boolean;
  totalWords: number;
  perSegment: Array<{
    key: string;
    label: string;
    words: number;
    maxWords: number;
    overLimit: boolean;
    missing: boolean;
    note: string;
  }>;
  assembled: string;
  globalNote: string;
};

const FRAMEWORKS: ScaffoldFramework[] = [
  {
    id: 'STAR',
    name: 'STAR',
    bestFor: ['interview', 'behavioral_question'],
    description: 'Classic behavioral-interview scaffold: Situation, Task, Action, Result.',
    segments: [
      {
        key: 's',
        label: 'Situation',
        prompt: 'In one line: where, when, who.',
        maxWords: 25,
        exampleFill: 'Last quarter at Acme, our checkout team faced a 12% drop-off on mobile.'
      },
      {
        key: 't',
        label: 'Task',
        prompt: 'What were you specifically responsible for?',
        maxWords: 15,
        exampleFill: 'I owned the recovery target: cut drop-off in half by quarter-end.'
      },
      {
        key: 'a',
        label: 'Action',
        prompt: 'What did YOU do? Use "I", not "we".',
        maxWords: 40,
        exampleFill: 'I ran a session-replay audit, prioritized three friction points, partnered with design on a one-tap pay flow, and shipped daily A/B tests for two weeks while coaching two engineers on the rollout.'
      },
      {
        key: 'r',
        label: 'Result',
        prompt: 'Quantified outcome — number, percent, or time saved.',
        maxWords: 25,
        exampleFill: 'Drop-off fell from 12% to 5% in three weeks, lifting revenue by roughly $180k a month.'
      }
    ],
    totalWordTarget: 105,
    closingHint: 'Land with the measurable result.'
  },
  {
    id: 'CAR',
    name: 'CAR',
    bestFor: ['interview', 'behavioral_question'],
    description: 'Compressed behavioral scaffold: Context, Action, Result. Use when STAR feels long.',
    segments: [
      {
        key: 'c',
        label: 'Context',
        prompt: 'One-line setup: what was happening and why it mattered.',
        maxWords: 25,
        exampleFill: 'Our top enterprise account was threatening to churn after a botched migration.'
      },
      {
        key: 'a',
        label: 'Action',
        prompt: 'What you personally did — concrete verbs.',
        maxWords: 45,
        exampleFill: 'I flew on-site, ran a root-cause review with their CTO, rebuilt the migration plan in 48 hours, set up a daily standup with our infra team, and personally signed off on each cutover step until completion.'
      },
      {
        key: 'r',
        label: 'Result',
        prompt: 'The outcome with a number or status change.',
        maxWords: 25,
        exampleFill: 'Account renewed for a three-year deal worth $2.1M and became a public reference customer.'
      }
    ],
    totalWordTarget: 95,
    closingHint: 'Land with the measurable result.'
  },
  {
    id: 'PREP',
    name: 'PREP',
    bestFor: ['public_speaking', 'board_update', 'one_minute_answer'],
    description: 'Speaking scaffold: Point, Reason, Example, Point. Anchored at both ends.',
    segments: [
      {
        key: 'p1',
        label: 'Point',
        prompt: 'State your position in one crisp sentence.',
        maxWords: 20,
        exampleFill: 'We should pause the new launch until the analytics regression is fixed.'
      },
      {
        key: 'r',
        label: 'Reason',
        prompt: 'Why is this true? Cause, evidence, principle.',
        maxWords: 25,
        exampleFill: 'Without trustworthy metrics we cannot tell if the launch is helping or hurting the funnel.'
      },
      {
        key: 'e',
        label: 'Example',
        prompt: 'Concrete example, story, or data point.',
        maxWords: 40,
        exampleFill: 'Last quarter we shipped the pricing page with a similar gap and only caught a 6% conversion drop two weeks later, after losing about $400k in pipeline that we never recovered.'
      },
      {
        key: 'p2',
        label: 'Point',
        prompt: 'Restate the original point, sharpened.',
        maxWords: 15,
        exampleFill: 'Fix the regression first, then ship — it costs us less.'
      }
    ],
    totalWordTarget: 100,
    closingHint: 'Echo the opening point so the audience hears the spine of your argument.'
  },
  {
    id: 'SCQA',
    name: 'SCQA',
    bestFor: ['executive_brief', 'consulting_pitch'],
    description: 'McKinsey-style executive scaffold: Situation, Complication, Question, Answer.',
    segments: [
      {
        key: 's',
        label: 'Situation',
        prompt: 'The current stable state everyone agrees on.',
        maxWords: 25,
        exampleFill: 'Our sales team has consistently hit 102% of quota for the last six quarters.'
      },
      {
        key: 'c',
        label: 'Complication',
        prompt: 'What changed or is at risk.',
        maxWords: 25,
        exampleFill: 'Two of our top three reps are leaving in Q3, and our pipeline coverage has just dropped to 1.8x.'
      },
      {
        key: 'q',
        label: 'Question',
        prompt: 'The implicit question the audience now has.',
        maxWords: 15,
        exampleFill: 'How do we protect next-year revenue without overreacting?'
      },
      {
        key: 'a',
        label: 'Answer',
        prompt: 'Your recommendation, stated as a clear answer.',
        maxWords: 40,
        exampleFill: 'Promote two senior AEs into the gap, hire one external closer for the largest deal, and shift 20% of marketing budget from awareness to mid-funnel for the next two quarters.'
      }
    ],
    totalWordTarget: 105,
    closingHint: 'End with the answer — never trail off into more context.'
  },
  {
    id: 'BLUF',
    name: 'BLUF',
    bestFor: ['email', 'status_update', 'q_and_a'],
    description: 'Bottom-Line Up Front: lead with the conclusion, then justify it.',
    segments: [
      {
        key: 'b',
        label: 'Bottom Line',
        prompt: 'The conclusion or ask in one short sentence.',
        maxWords: 15,
        exampleFill: 'Approve the $250k budget shift to platform reliability this quarter.'
      },
      {
        key: 'r',
        label: 'Supporting Reason',
        prompt: 'The reason and any critical evidence.',
        maxWords: 45,
        exampleFill: 'Three of our last four major incidents traced to the same legacy queue, and a vendor benchmark shows we can cut incident time by 60% with the new system, paying back the spend within two quarters of saved on-call and revenue.'
      }
    ],
    totalWordTarget: 60,
    closingHint: 'Stop after the reason — do not bury the ask in caveats.'
  },
  {
    id: 'PYRAMID',
    name: 'Minto Pyramid',
    bestFor: ['presentation_open', 'board_recommendation'],
    description: 'Minto Pyramid: lead with a headline, support with three pillars, close cleanly.',
    segments: [
      {
        key: 'h',
        label: 'Headline',
        prompt: 'One-sentence governing recommendation or finding.',
        maxWords: 20,
        exampleFill: 'We should consolidate to a single CRM by year-end to unlock revenue and cut $1.2M in cost.'
      },
      {
        key: 's',
        label: 'Three Supports',
        prompt: 'Three parallel reasons that prove the headline.',
        maxWords: 75,
        exampleFill: 'First, sales reps lose roughly six hours a week reconciling two systems, which adds up to over $900k in opportunity cost annually. Second, marketing attribution is broken across the duplicate pipelines, so we cannot reliably allocate the next $4M in spend. Third, our new AI assistant features only ship on the modern platform, meaning we delay every roadmap quarter we wait.'
      },
      {
        key: 'c',
        label: 'Close',
        prompt: 'A clear next step or decision request.',
        maxWords: 15,
        exampleFill: 'I am asking for sign-off today so migration starts next month.'
      }
    ],
    totalWordTarget: 110,
    closingHint: 'Close with the decision you need — never with more analysis.'
  }
];

function countWords(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0).length;
}

function cloneFramework(framework: ScaffoldFramework): ScaffoldFramework {
  return {
    ...framework,
    bestFor: [...framework.bestFor],
    segments: framework.segments.map((segment) => ({ ...segment }))
  };
}

export function listScaffoldFrameworks(): ScaffoldFramework[] {
  return FRAMEWORKS.map(cloneFramework);
}

export function findScaffoldFramework(id: ScaffoldFrameworkId): ScaffoldFramework | undefined {
  const match = FRAMEWORKS.find((framework) => framework.id === id);
  return match ? cloneFramework(match) : undefined;
}

export function evaluateScaffoldFill(input: ScaffoldFill): ScaffoldEvaluation {
  const framework = FRAMEWORKS.find((entry) => entry.id === input.frameworkId);

  if (!framework) {
    return {
      ok: false,
      totalWords: 0,
      perSegment: [],
      assembled: '',
      globalNote: `Unknown framework "${input.frameworkId}". Pick one of STAR, CAR, PREP, SCQA, BLUF, or PYRAMID.`
    };
  }

  const segmentResults = framework.segments.map((segment) => {
    const raw = (input.segments?.[segment.key] ?? '').toString();
    const trimmed = raw.trim();
    const words = countWords(trimmed);
    const missing = words === 0;
    const overLimit = words > segment.maxWords;

    let note: string;
    if (missing) {
      note = 'Add at least one sentence.';
    } else if (overLimit) {
      note = `Cut to ${segment.maxWords} words.`;
    } else if (words <= Math.max(3, Math.floor(segment.maxWords * 0.3))) {
      note = `Tight — you have room up to ${segment.maxWords} words if it adds value.`;
    } else {
      note = `Good — within the ${segment.maxWords}-word target.`;
    }

    return {
      key: segment.key,
      label: segment.label,
      words,
      maxWords: segment.maxWords,
      overLimit,
      missing,
      note,
      _trimmed: trimmed
    };
  });

  const totalWords = segmentResults.reduce((sum, item) => sum + item.words, 0);
  const anyMissing = segmentResults.some((item) => item.missing);
  const anyOver = segmentResults.some((item) => item.overLimit);
  const ok = !anyMissing && !anyOver;

  const assembledParts = segmentResults
    .map((item) => item._trimmed.replace(/\s+/g, ' ').replace(/[.\s]+$/, ''))
    .filter((piece) => piece.length > 0);

  let assembled = assembledParts.join('. ').trim();
  if (assembled.length > 0 && !/[.!?]$/.test(assembled)) {
    assembled = `${assembled}.`;
  }

  const globalNote = ok
    ? 'Solid scaffold. Now read it out loud once, then again at half the pace.'
    : `Trim the long segments and complete missing ones — keep total under ${framework.totalWordTarget}.`;

  const perSegment = segmentResults.map(({ _trimmed: _omit, ...rest }) => rest);

  return {
    ok,
    totalWords,
    perSegment,
    assembled,
    globalNote
  };
}
