// Evidence-based journaling prompts and structured templates.
// Grounded in positive psychology (gratitude, savouring), CBT (thought records,
// cognitive reframing), self-compassion (Kristin Neff), and values/ACT work.
// Pure data + helpers — no side effects, safe to import anywhere.

export type JournalTechnique =
  | "free"
  | "prompt"
  | "gratitude"
  | "reflection"
  | "cbt";

export interface TechniqueMeta {
  key: JournalTechnique;
  label: string;
  blurb: string;
  /** Scaffold inserted into the editor. Empty for free writing. */
  template: string;
  /** Optional default title suggestion. */
  title?: string;
}

export const TECHNIQUES: TechniqueMeta[] = [
  {
    key: "free",
    label: "Free write",
    blurb: "An open page. Write whatever is present for you.",
    template: "",
  },
  {
    key: "prompt",
    label: "Guided prompt",
    blurb: "Answer a reflective question chosen for you.",
    template: "",
  },
  {
    key: "gratitude",
    label: "Gratitude",
    blurb: "Savour three good things — proven to lift mood over time.",
    title: "Gratitude",
    template:
      "Three things I'm grateful for today:\n" +
      "1. \n" +
      "2. \n" +
      "3. \n\n" +
      "Why one of these mattered to me:\n",
  },
  {
    key: "reflection",
    label: "Daily reflection",
    blurb: "Close the day with what went well, what you learned, what's next.",
    title: "Daily reflection",
    template:
      "What went well today?\n\n" +
      "What did I learn about myself?\n\n" +
      "What will I do differently tomorrow?\n",
  },
  {
    key: "cbt",
    label: "Reframe (CBT)",
    blurb:
      "Untangle a hard thought: situation → thought → evidence → balanced view.",
    title: "Thought reframe",
    template:
      "The situation (just the facts of what happened):\n\n" +
      "The automatic thought / what I told myself:\n\n" +
      "Evidence FOR this thought:\n\n" +
      "Evidence AGAINST it:\n\n" +
      "A kinder, more balanced way to see it:\n\n" +
      "How I feel now:\n",
  },
];

export interface PromptCategory {
  name: string;
  prompts: string[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    name: "Gratitude & savouring",
    prompts: [
      "What is one small thing today that you'd miss if it were gone?",
      "Who made your life a little easier recently, and how?",
      "Describe a moment today that felt genuinely good. Relive it in detail.",
      "What is something about your body or health you're thankful for?",
    ],
  },
  {
    name: "Self-awareness",
    prompts: [
      "What emotion has been loudest for you this week? Where do you feel it in your body?",
      "What were you avoiding today, and what was underneath the avoidance?",
      "When did you feel most like yourself recently?",
      "What is a story you keep telling about yourself? Is it still true?",
    ],
  },
  {
    name: "Self-compassion",
    prompts: [
      "What would you say to a close friend going through exactly what you're facing?",
      "Where are you being hard on yourself? Offer yourself one kind sentence.",
      "What do you need right now that you haven't been giving yourself?",
      "Name one mistake you can forgive yourself for today.",
    ],
  },
  {
    name: "Values & direction",
    prompts: [
      "If this year went beautifully, what would be different by its end?",
      "What matters to you that you've been neglecting?",
      "Whose life or character do you admire, and what does that reveal about your values?",
      "What would you do this week if you knew you couldn't fail?",
    ],
  },
  {
    name: "Growth & resilience",
    prompts: [
      "What's a recent setback teaching you, even if it still stings?",
      "What is one fear that's been shrinking your life? What's one step through it?",
      "When have you been resilient before? What helped you then?",
      "What habit, if you kept it for a year, would change your life most?",
    ],
  },
  {
    name: "Relationships",
    prompts: [
      "Is there something unsaid you're carrying? Write it here first.",
      "Who deserves your appreciation, and what would you tell them?",
      "Where do you need a clearer boundary, and what would it sound like?",
      "How did you show up for someone today — or how did they show up for you?",
    ],
  },
];

export const ALL_PROMPTS: string[] = PROMPT_CATEGORIES.flatMap((c) => c.prompts);

/** Day-of-year so the "prompt of the day" is stable for a given date. */
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function getPromptOfTheDay(date: Date = new Date()): string {
  return ALL_PROMPTS[dayOfYear(date) % ALL_PROMPTS.length];
}

/** A small shuffled-ish sample (deterministic-free) for the picker. */
export function samplePrompts(count = 4): string[] {
  const pool = [...ALL_PROMPTS];
  const out: string[] = [];
  while (pool.length && out.length < count) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
