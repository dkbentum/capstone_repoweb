const { buildSubjectLeaderboard } = require("./scoreTools");

const classWeight = 40;
const examWeight = 60;

const demoRows = [
  { id: "STD-001", name: "Ada Johnson", classScore: 38, examScore: 62 },
  { id: "STD-002", name: "Musa Ibrahim", classScore: 34, examScore: 58 },
  { id: "STD-003", name: "Kojo Mensah", classScore: 40, examScore: 65 }
];

const leaderboard = buildSubjectLeaderboard(demoRows, classWeight, examWeight);

console.log("Node.js Side Module Demo: Weighted Subject Leaderboard");
console.log(`Weights -> ClassScore: ${classWeight}% | ExamScore: ${examWeight}%`);
console.table(
  leaderboard.map((row) => ({
    id: row.id,
    name: row.name,
    classScore: row.classScore,
    examScore: row.examScore,
    finalScore: row.score,
    position: row.rankLabel
  }))
);
