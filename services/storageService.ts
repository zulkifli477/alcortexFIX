import { DiagnosisRecord } from '../types';

const RECORDS_KEY = 'mednexus_records';

export const saveRecord = (record: DiagnosisRecord) => {
  const recordsStr = localStorage.getItem(RECORDS_KEY);
  const records: DiagnosisRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
  records.push(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const getRecordsByUser = (userId: string): DiagnosisRecord[] => {
  const recordsStr = localStorage.getItem(RECORDS_KEY);
  const records: DiagnosisRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
  return records.filter(r => r.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getAllRecords = (): DiagnosisRecord[] => {
  const recordsStr = localStorage.getItem(RECORDS_KEY);
  return recordsStr ? JSON.parse(recordsStr) : [];
}