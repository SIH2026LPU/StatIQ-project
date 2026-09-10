export interface NSSTAProgramme {
  title: string;
  description: string;
  trainingType: string;
  topic: string;
  targetRole: string;
  duration: string;
  batch: string;
  venue: string;
  year: string;
  sourceUrl: string;
  sourceDocument: string;
}

export interface NSSTAProvider {
  listProgrammes(): Promise<NSSTAProgramme[]>;
  listCalendar(): Promise<NSSTAProgramme[]>;
  listTpac(): Promise<NSSTAProgramme[]>;
  mode: "html-ingest";
}
