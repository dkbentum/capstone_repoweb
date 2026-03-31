function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function weightedScore(classScore, examScore, classWeight, examWeight) {
  const cls = toNumber(classScore);
  const exm = toNumber(examScore);
  const cw = toNumber(classWeight);
  const ew = toNumber(examWeight);
  return Number(((cls * cw + exm * ew) / 100).toFixed(2));
}

function ordinal(rank) {
  const n = toNumber(rank, 0);
  if (!n) return "-";
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  if (n % 10 === 1) return `${n}st`;
  if (n % 10 === 2) return `${n}nd`;
  if (n % 10 === 3) return `${n}rd`;
  return `${n}th`;
}

function assignCompetitionPositions(scoredRows) {
  const sorted = [...scoredRows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  let lastScore = null;
  let lastRank = 0;

  return sorted.map((row, index) => {
    if (lastScore === null || row.score !== lastScore) {
      lastRank = index + 1;
      lastScore = row.score;
    }
    return { ...row, rank: lastRank, rankLabel: ordinal(lastRank) };
  });
}

function buildSubjectLeaderboard(subjectRows, classWeight, examWeight) {
  const scored = subjectRows.map((row) => ({
    id: row.id || "",
    name: row.name || "Unknown Student",
    classScore: toNumber(row.classScore),
    examScore: toNumber(row.examScore),
    score: weightedScore(row.classScore, row.examScore, classWeight, examWeight)
  }));

  return assignCompetitionPositions(scored);
}

module.exports = {
  weightedScore,
  ordinal,
  assignCompetitionPositions,
  buildSubjectLeaderboard
};
