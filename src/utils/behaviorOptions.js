export const BEHAVIOR_OPTIONS = [
  { type: "demerit", reason: "Does not follow directions" },
  { type: "demerit", reason: "Off-task behavior" },
  { type: "demerit", reason: "Leaves assigned workspace" },
  { type: "demerit", reason: "Uses an unauthorized resource" },
  { type: "demerit", reason: "Disrupts another student" },
  { type: "demerit", reason: "Repeatedly ignores teacher correction" },
  { type: "merit", reason: "Follows directions" },
  { type: "merit", reason: "Stays focused on the task" },
  { type: "merit", reason: "Shows careful mathematical thinking" },
  { type: "merit", reason: "Uses the scratchpad productively" },
  { type: "merit", reason: "Helps maintain a respectful classroom" },
  { type: "merit", reason: "Persists through a challenging problem" },
];

export function getBehaviorOptions(type) {
  return type ? BEHAVIOR_OPTIONS.filter((option) => option.type === type) : BEHAVIOR_OPTIONS;
}
