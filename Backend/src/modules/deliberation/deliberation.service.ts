import path from "path";
import fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
} from "docx";
import ExcelJS from "exceljs";
import { identityDb, correctionDb } from "../../config/db.js";
import { sendEmail } from "../../utils/mailer.js";
import { AppError } from "../../utils/AppError.js";
import {
  deliberationCoordinatorTemplate,
  deliberationCandidateTemplate,
} from "../../utils/emailTemplates.js";
import type {
  DeliberationResult,
  RankedCandidate,
  SubjectGrade,
  DeliberationStats,
  WarningCandidate,
  CandidateWithGrades,
  JuryMember,
  AnonymatMember,
  AdmissionResult,
  ComputeDeliberationResponse,
  CloseDeliberationResponse,
  RankingResponse,
  SessionStaffRow,
} from "./deliberation.types.js";

// ─── FILE STORAGE ROOT ────────────────────────────────────────────────────────

const STORAGE_ROOT = path.resolve("src/generated/files/deliberation");

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sessionDir(sessionId: string): string {
  const dir = path.join(STORAGE_ROOT, sessionId);
  ensureDir(dir);
  return dir;
}

// ─── WEIGHTED AVERAGE ─────────────────────────────────────────────────────────

function computeWeightedAverage(grades: SubjectGrade[]): number {
  const totalWeight = grades.reduce((s, g) => s + g.coefficient, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = grades.reduce((s, g) => s + g.grade * g.coefficient, 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// ─── ADMISSION RESULT ─────────────────────────────────────────────────────────

function resolveAdmission(
  rank: number,
  availableSlots: number,
  waitingListSlots: number,
): AdmissionResult {
  if (rank <= availableSlots) return "Admis(e)";
  if (rank <= availableSlots + waitingListSlots) return "En liste d'attente";
  return "Ajourné(e)";
}

// ─── DOCX HELPERS ─────────────────────────────────────────────────────────────

const borderSingle = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const cellBorders = {
  top: borderSingle,
  bottom: borderSingle,
  left: borderSingle,
  right: borderSingle,
};
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold: true, size: 20, font: "Times New Roman" }),
        ],
      }),
    ],
  });
}

function dataCell(text: string, width: number, bold = false): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold, size: 20, font: "Times New Roman" }),
        ],
      }),
    ],
  });
}

function boldParagraph(
  text: string,
  size = 22,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
): Paragraph {
  return new Paragraph({
    alignment: align,
    spacing: { after: 120 },
    children: [
      new TextRun({ text, bold: true, size, font: "Times New Roman" }),
    ],
  });
}

function normalParagraph(
  text: string,
  size = 20,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
): Paragraph {
  return new Paragraph({
    alignment: align,
    spacing: { after: 80 },
    children: [new TextRun({ text, size, font: "Times New Roman" })],
  });
}

function spacer(): Paragraph {
  return new Paragraph({
    children: [new TextRun("")],
    spacing: { after: 120 },
  });
}

// ─── JURY TABLE ───────────────────────────────────────────────────────────────

function buildJuryTable(members: JuryMember[], totalWidth: number): Table {
  const colWidths = [
    Math.round(totalWidth * 0.35),
    Math.round(totalWidth * 0.2),
    Math.round(totalWidth * 0.35),
    Math.round(totalWidth * 0.1),
  ];
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: [
          headerCell("Nom & Prénoms", colWidths[0]!),
          headerCell("Grade", colWidths[1]!),
          headerCell("Faculté/Institut d'Origine", colWidths[2]!),
          headerCell("Emargement", colWidths[3]!),
        ],
      }),
      ...members.map(
        (m) =>
          new TableRow({
            children: [
              dataCell(`${m.lastName} ${m.firstName}`, colWidths[0]!),
              dataCell(m.academicGrade ?? "", colWidths[1]!),
              dataCell(m.institution ?? "", colWidths[2]!),
              dataCell("", colWidths[3]!),
            ],
          }),
      ),
    ],
  });
}

// ─── FETCH COMBINED DATA ──────────────────────────────────────────────────────

async function fetchCandidatesWithGrades(
  sessionId: string,
): Promise<CandidateWithGrades[]> {
  const subjects = await identityDb.subject.findMany({
    where: { sessionId },
    select: { id: true, name: true, coefficient: true },
  });

  const anonymatMappings = await identityDb.anonymatMapping.findMany({
    where: { sessionId },
    select: {
      candidateId: true,
      subjectId: true,
      anonymousCode: true,
      qrCode: true,
    },
  });

  const mappingByQr = new Map<
    string,
    { candidateId: string; subjectId: string; anonymousCode: string }
  >();
  for (const m of anonymatMappings) {
    mappingByQr.set(m.qrCode, {
      candidateId: m.candidateId,
      subjectId: m.subjectId,
      anonymousCode: m.anonymousCode,
    });
  }

  const finalGrades = await correctionDb.finalGrade.findMany({
    where: { sessionId },
    include: { copy: { select: { qrCode: true, anonymousCode: true } } },
  });

  const gradeMap = new Map<string, { grade: number; anonymousCode: string }>();
  for (const fg of finalGrades) {
    const mapping = mappingByQr.get(fg.copy.qrCode);
    if (!mapping) continue;
    const key = `${mapping.candidateId}:${fg.subjectId}`;
    gradeMap.set(key, {
      grade: fg.finalGrade,
      anonymousCode: fg.copy.anonymousCode ?? mapping.anonymousCode,
    });
  }

  const candidates = await identityDb.candidate.findMany({
    where: { sessionId },
    select: {
      id: true,
      registrationNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      specializationId: true,
    },
  });

  const result: CandidateWithGrades[] = [];

  for (const c of candidates) {
    if (!c.specializationId) continue;

    const subjectGrades = subjects
      .map((s) => {
        const gradeEntry = gradeMap.get(`${c.id}:${s.id}`);
        if (!gradeEntry) return null;
        const qrEntry = anonymatMappings.find(
          (m) => m.candidateId === c.id && m.subjectId === s.id,
        );
        return {
          subjectId: s.id,
          subjectName: s.name,
          coefficient: s.coefficient,
          grade: gradeEntry.grade,
          anonymousCode: gradeEntry.anonymousCode,
          qrCode: qrEntry?.qrCode ?? "",
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);

    if (subjectGrades.length !== subjects.length) continue;

    result.push({
      candidateId: c.id,
      registrationNumber: c.registrationNumber,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      specializationId: c.specializationId,
      subjectGrades,
    });
  }

  return result;
}

// ─── RANK PER SPECIALIZATION ─────────────────────────────────────────────────

async function rankBySpecialization(
  sessionId: string,
  candidatesWithGrades: CandidateWithGrades[],
): Promise<DeliberationResult[]> {
  const sessionSpecializations =
    await identityDb.sessionSpecialization.findMany({
      where: { sessionId },
      include: {
        formationSpecialization: { select: { name: true, code: true } },
      },
    });

  const results: DeliberationResult[] = [];

  for (const spec of sessionSpecializations) {
    const specCandidates = candidatesWithGrades.filter(
      (c) => c.specializationId === spec.id,
    );

    const withAvg = specCandidates.map((c) => ({
      ...c,
      weightedAverage: computeWeightedAverage(
        c.subjectGrades.map((sg) => ({
          subjectId: sg.subjectId,
          subjectName: sg.subjectName,
          coefficient: sg.coefficient,
          grade: sg.grade,
          anonymousCode: sg.anonymousCode,
        })),
      ),
    }));

    withAvg.sort((a, b) => b.weightedAverage - a.weightedAverage);

    const rankedCandidates: RankedCandidate[] = withAvg.map((c, i) => {
      const rank = i + 1;
      const result = resolveAdmission(
        rank,
        spec.availableSlots,
        spec.waitingListSlots,
      );
      const anonymousCodes: Record<string, string> = {};
      c.subjectGrades.forEach((sg) => {
        anonymousCodes[sg.subjectId] = sg.anonymousCode;
      });
      return {
        rank,
        candidateId: c.candidateId,
        registrationNumber: c.registrationNumber,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        anonymousCodes,
        subjectGrades: c.subjectGrades,
        weightedAverage: c.weightedAverage,
        result,
      };
    });

    results.push({
      sessionId,
      specializationId: spec.id,
      specializationName: spec.formationSpecialization.name,
      availableSlots: spec.availableSlots,
      waitingListSlots: spec.waitingListSlots,
      rankedCandidates,
      computedAt: new Date(),
    });
  }

  return results;
}

// ─── BUILD STATS ─────────────────────────────────────────────────────────────

function buildStats(results: DeliberationResult[]): DeliberationStats[] {
  return results.map((r) => {
    const admitted = r.rankedCandidates.filter(
      (c) => c.result === "Admis(e)",
    ).length;
    const waitlisted = r.rankedCandidates.filter(
      (c) => c.result === "En liste d'attente",
    ).length;
    const rejected = r.rankedCandidates.filter(
      (c) => c.result === "Ajourné(e)",
    ).length;
    const warningCandidates: WarningCandidate[] = r.rankedCandidates
      .filter((c) => c.result === "Admis(e)" && c.weightedAverage < 10)
      .map((c) => ({
        firstName: c.firstName,
        lastName: c.lastName,
        weightedAverage: c.weightedAverage,
        rank: c.rank,
      }));
    return {
      specializationId: r.specializationId,
      specializationName: r.specializationName,
      total: r.rankedCandidates.length,
      admitted,
      waitlisted,
      rejected,
      warningCandidates,
    };
  });
}

// ─── GENERATE XLSX ────────────────────────────────────────────────────────────

async function generateXlsx(
  sessionId: string,
  sessionLabel: string,
  academicYear: string,
  results: DeliberationResult[],
): Promise<string> {
  const dir = sessionDir(sessionId);
  const filePath = path.join(dir, `deliberation-${sessionId}.xlsx`);
  const wb = new ExcelJS.Workbook();

  for (const specResult of results) {
    const sheetName = specResult.specializationName.substring(0, 31);
    const ws = wb.addWorksheet(sheetName);

    ws.mergeCells("A1:G1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `Délibération — ${specResult.specializationName}`;
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFF0000" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFD9D9" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 28;

    ws.mergeCells("A2:G2");
    const yearCell = ws.getCell("A2");
    yearCell.value = `Année universitaire : ${academicYear} — Session : ${sessionLabel}`;
    yearCell.font = { bold: true, size: 12 };
    yearCell.alignment = { horizontal: "center" };
    ws.getRow(2).height = 20;

    const subjects = specResult.rankedCandidates[0]?.subjectGrades ?? [];
    const headers = [
      "Classement",
      ...subjects.flatMap((s) => [`Code ${s.subjectName}`, "Note"]),
      "Moyenne Générale",
      "Résultat",
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFD9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    for (const candidate of specResult.rankedCandidates) {
      const rowData = [
        candidate.rank,
        ...candidate.subjectGrades.flatMap((sg) => [
          sg.anonymousCode,
          sg.grade,
        ]),
        candidate.weightedAverage,
        candidate.result,
      ];
      const row = ws.addRow(rowData);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (candidate.result === "Admis(e)") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE2EFDA" },
          };
        } else if (candidate.result === "En liste d'attente") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF2CC" },
          };
        }
      });
    }

    ws.columns.forEach((col) => {
      col.width = 18;
    });
    ws.getColumn(1).width = 14;
  }

  await wb.xlsx.writeFile(filePath);
  return filePath;
}

// ─── SHARED PV CONTENT BUILDER ────────────────────────────────────────────────

function buildPvSectionChildren(opts: {
  title: string;
  subtitle?: string;
  academicYear: string;
  formationName: string;
  department: string;
  specializationName: string;
  juryMembers: JuryMember[];
  anonymatMembers: AnonymatMember[];
  rankingTable: Table;
  introText: string;
  contentWidth: number;
}) {
  return [
    boldParagraph(opts.title, 28, AlignmentType.CENTER),
    ...(opts.subtitle
      ? [boldParagraph(opts.subtitle, 22, AlignmentType.CENTER)]
      : []),
    boldParagraph(
      `ANNÉE UNIVERSITAIRE ${opts.academicYear}`,
      22,
      AlignmentType.CENTER,
    ),
    spacer(),
    normalParagraph(opts.introText, 20),
    spacer(),
    boldParagraph(
      `Le Comité de la Formation Doctorale (CFD) : ${opts.formationName}`,
    ),
    normalParagraph(`Département : ${opts.department}`),
    normalParagraph(`Spécialité : ${opts.specializationName}`),
    spacer(),
    buildJuryTable(opts.juryMembers, opts.contentWidth),
    spacer(),
    boldParagraph("La Cellule de l'Anonymat composée de :"),
    buildJuryTable(opts.anonymatMembers as JuryMember[], opts.contentWidth),
    spacer(),
    normalParagraph(
      "Les délibérations ont donné lieu aux résultats suivants (Par ordre de mérite) :",
    ),
    spacer(),
    opts.rankingTable,
    spacer(),
    spacer(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 480 },
      children: [
        new TextRun({
          text: "Date Le    …/…/……..                                                                        Le Responsable du CFD",
          size: 20,
          font: "Times New Roman",
        }),
      ],
    }),
  ];
}

// ─── GENERATE PV ANONYMAT ─────────────────────────────────────────────────────

async function generatePvAnonymat(
  sessionId: string,
  sessionLabel: string,
  academicYear: string,
  formationName: string,
  department: string,
  results: DeliberationResult[],
  juryMembers: JuryMember[],
  anonymatMembers: AnonymatMember[],
): Promise<string> {
  const dir = sessionDir(sessionId);
  const filePath = path.join(dir, `pv-anonymat-${sessionId}.docx`);
  const CONTENT_WIDTH = 9026;

  const sections = results.map((specResult) => {
    const subjects = specResult.rankedCandidates[0]?.subjectGrades ?? [];
    const rankW = 700;
    const codeW = Math.round(
      (CONTENT_WIDTH - rankW - 1400 - 700) / (subjects.length * 2),
    );
    const avgW = 1400;
    const resW = 700;
    const colWidths = [
      rankW,
      ...subjects.flatMap(() => [codeW, codeW]),
      avgW,
      resW,
    ];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    const rankingTable = new Table({
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [
        new TableRow({
          children: [
            headerCell("Classement", rankW),
            ...subjects.flatMap((s) => [
              headerCell(`Code\n${s.subjectName}`, codeW),
              headerCell("Note", codeW),
            ]),
            headerCell("Moyenne Générale", avgW),
            headerCell("Résultat", resW),
          ],
        }),
        ...specResult.rankedCandidates.map(
          (c) =>
            new TableRow({
              children: [
                dataCell(String(c.rank), rankW, true),
                ...c.subjectGrades.flatMap((sg) => [
                  dataCell(sg.anonymousCode, codeW),
                  dataCell(String(sg.grade), codeW),
                ]),
                dataCell(String(c.weightedAverage), avgW, true),
                dataCell(c.result, resW),
              ],
            }),
        ),
      ],
    });

    return {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: buildPvSectionChildren({
        title: "PROCÈS VERBAL DE DÉLIBÉRATION SOUS ANONYMAT",
        academicYear,
        formationName,
        department,
        specializationName: specResult.specializationName,
        juryMembers,
        anonymatMembers,
        rankingTable,
        contentWidth: CONTENT_WIDTH,
        introText: `En application des dispositions relatives aux modalités d'organisation du concours d'accès à la formation de troisième cycle en vue de l'obtention du diplôme de doctorat au titre de l'année universitaire ${academicYear}, se sont réunis pour délibérer sous anonymat :`,
      }),
    };
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 20 } } },
    },
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// ─── GENERATE PV NOMINATIF ────────────────────────────────────────────────────

async function generatePvNominatif(
  sessionId: string,
  sessionLabel: string,
  academicYear: string,
  formationName: string,
  department: string,
  results: DeliberationResult[],
  juryMembers: JuryMember[],
  anonymatMembers: AnonymatMember[],
): Promise<string> {
  const dir = sessionDir(sessionId);
  const filePath = path.join(dir, `pv-nominatif-${sessionId}.docx`);
  const CONTENT_WIDTH = 9026;

  const sections = results.map((specResult) => {
    const subjects = specResult.rankedCandidates[0]?.subjectGrades ?? [];
    const rankW = 700;
    const nameW = 2400;
    const avgW = 1400;
    const resW = 700;
    const codeW = Math.round(
      (CONTENT_WIDTH - rankW - nameW - avgW - resW) / subjects.length,
    );
    const colWidths = [rankW, ...subjects.map(() => codeW), nameW, avgW, resW];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    const rankingTable = new Table({
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [
        new TableRow({
          children: [
            headerCell("Classement", rankW),
            ...subjects.map((s) => headerCell(`Code ${s.subjectName}`, codeW)),
            headerCell("Nom et Prénoms", nameW),
            headerCell("Moyenne Générale", avgW),
            headerCell("Résultat", resW),
          ],
        }),
        ...specResult.rankedCandidates.map(
          (c) =>
            new TableRow({
              children: [
                dataCell(String(c.rank), rankW, true),
                ...c.subjectGrades.map((sg) =>
                  dataCell(sg.anonymousCode, codeW),
                ),
                dataCell(`${c.lastName} ${c.firstName}`, nameW),
                dataCell(String(c.weightedAverage), avgW, true),
                dataCell(c.result, resW),
              ],
            }),
        ),
      ],
    });

    return {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: buildPvSectionChildren({
        title: "PROCÈS VERBAL DE DÉLIBÉRATIONS NOMINATIF",
        subtitle: "(Levée de l'Anonymat)",
        academicYear,
        formationName,
        department,
        specializationName: specResult.specializationName,
        juryMembers,
        anonymatMembers,
        rankingTable,
        contentWidth: CONTENT_WIDTH,
        introText: `En application des dispositions relatives aux modalités d'organisation du concours d'accès à la formation de troisième cycle en vue de l'obtention du diplôme de doctorat au titre de l'année universitaire ${academicYear}, se sont réunis pour lever l'anonymat :`,
      }),
    };
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 20 } } },
    },
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// ─── PUBLIC SERVICE ───────────────────────────────────────────────────────────

export const deliberationService = {
  async compute(sessionId: string): Promise<ComputeDeliberationResponse> {
    const session = await identityDb.competitionSession.findUnique({
      where: { id: sessionId },
      include: {
        formation: {
          include: {
            coordinator: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!session) throw new AppError("Session introuvable", 404);

    if (!["CORRECTION_OPEN", "DELIBERATION"].includes(session.status)) {
      throw new AppError(
        `La délibération ne peut pas être calculée pour une session en statut "${session.status}"`,
        400,
      );
    }

    const candidatesWithGrades = await fetchCandidatesWithGrades(sessionId);
    if (candidatesWithGrades.length === 0) {
      throw new AppError(
        "Aucun candidat avec des notes finales trouvé pour cette session",
        400,
      );
    }

    const results = await rankBySpecialization(sessionId, candidatesWithGrades);
    const stats = buildStats(results);

    await identityDb.competitionSession.update({
      where: { id: sessionId },
      data: { status: "DELIBERATION" },
    });

    const xlsxPath = await generateXlsx(
      sessionId,
      session.label,
      session.academicYear,
      results,
    );

    // ── Send coordinator email ────────────────────────────────────────────────
    let emailSent = false;
    const coord = session.formation.coordinator;
    if (coord?.email) {
      const { subject, html } = deliberationCoordinatorTemplate(
        `${coord.firstName} ${coord.lastName}`,
        session.label,
        stats,
      );
      await sendEmail({ emailto: coord.email, subject, html });
      emailSent = true;
    }

    return { sessionId, results, stats, xlsxPath, emailSent };
  },

  async getRanking(
    sessionId: string,
    specializationId?: string,
  ): Promise<RankingResponse> {
    const session = await identityDb.competitionSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new AppError("Session introuvable", 404);
    if (!["DELIBERATION", "CLOSED", "ARCHIVED"].includes(session.status)) {
      throw new AppError("Les résultats ne sont pas encore disponibles", 400);
    }
    const candidatesWithGrades = await fetchCandidatesWithGrades(sessionId);
    let results = await rankBySpecialization(sessionId, candidatesWithGrades);
    if (specializationId) {
      results = results.filter((r) => r.specializationId === specializationId);
    }
    return { sessionId, specializations: results };
  },

  async close(sessionId: string): Promise<CloseDeliberationResponse> {
    const session = await identityDb.competitionSession.findUnique({
      where: { id: sessionId },
      include: {
        formation: {
          select: { name: true, department: true },
        },
        sessionStaff: {
          where: { function: { in: ["JURY_MEMBER", "ANONYMAT_COMITE"] } },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                academicGrade: true,
                institution: true,
              },
            },
          },
        },
      },
    });

    if (!session) throw new AppError("Session introuvable", 404);
    if (session.status !== "DELIBERATION") {
      throw new AppError(
        "La session doit être en statut DELIBERATION pour être clôturée",
        400,
      );
    }

    const candidatesWithGrades = await fetchCandidatesWithGrades(sessionId);
    const results = await rankBySpecialization(sessionId, candidatesWithGrades);

    const juryMembers: JuryMember[] = (
      session.sessionStaff as SessionStaffRow[]
    )
      .filter((s) => s.function === "JURY_MEMBER")
      .map((s) => ({
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        academicGrade: s.user.academicGrade,
        institution: s.user.institution,
      }));

    const anonymatMembers: AnonymatMember[] = (
      session.sessionStaff as SessionStaffRow[]
    )
      .filter((s) => s.function === "ANONYMAT_COMITE")
      .map((s) => ({
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        academicGrade: s.user.academicGrade,
        institution: s.user.institution,
      }));

    const pvAnonymatPath = await generatePvAnonymat(
      sessionId,
      session.label,
      session.academicYear,
      session.formation.name,
      session.formation.department,
      results,
      juryMembers,
      anonymatMembers,
    );

    const pvNominatifPath = await generatePvNominatif(
      sessionId,
      session.label,
      session.academicYear,
      session.formation.name,
      session.formation.department,
      results,
      juryMembers,
      anonymatMembers,
    );

    await identityDb.competitionSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED" },
    });

    // ── Send candidate emails ─────────────────────────────────────────────────
    let candidateEmailsSent = 0;
    for (const specResult of results) {
      for (const candidate of specResult.rankedCandidates) {
        if (!candidate.email) continue;
        const { subject, html } = deliberationCandidateTemplate(
          `${candidate.firstName} ${candidate.lastName}`,
          session.label,
          specResult.specializationName,
          candidate.result,
          candidate.weightedAverage,
          candidate.rank,
        );
        await sendEmail({ emailto: candidate.email, subject, html });
        candidateEmailsSent++;
      }
    }

    return { sessionId, pvAnonymatPath, pvNominatifPath, candidateEmailsSent };
  },

  getPvAnonymatPath(sessionId: string): string {
    const p = path.join(
      STORAGE_ROOT,
      sessionId,
      `pv-anonymat-${sessionId}.docx`,
    );
    if (!fs.existsSync(p))
      throw new AppError(
        "PV Anonymat introuvable. Veuillez relancer la clôture.",
        404,
      );
    return p;
  },

  async getPvNominatifPath(sessionId: string): Promise<string> {
    const session = await identityDb.competitionSession.findUnique({
      where: { id: sessionId },
      select: { status: true },
    });
    if (!session) throw new AppError("Session introuvable", 404);
    if (!["CLOSED", "ARCHIVED"].includes(session.status)) {
      throw new AppError(
        "Le PV Nominatif est disponible uniquement après clôture de la session",
        403,
      );
    }
    const p = path.join(
      STORAGE_ROOT,
      sessionId,
      `pv-nominatif-${sessionId}.docx`,
    );
    if (!fs.existsSync(p))
      throw new AppError(
        "PV Nominatif introuvable. Veuillez relancer la clôture.",
        404,
      );
    return p;
  },
};
