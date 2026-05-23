export type AnonymizationPayload = {
  sessionId: string;
  subjectId: string;
  qrCode: string;
  anonymousCode: string;
}[];
