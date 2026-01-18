
import { Status } from './types';

export const INITIAL_PERIODICITIES = [
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
  'Bienal',
  'Única'
];

export const STATUS_COLORS: Record<Status, string> = {
  [Status.VIGENTE]: 'bg-green-500',
  [Status.PENDENTE]: 'bg-red-500',
  [Status.EM_ANDAMENTO]: 'bg-yellow-500',
  [Status.CONCLUIDO]: 'bg-blue-500',
};
