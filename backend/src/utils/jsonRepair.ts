import { jsonrepair } from 'jsonrepair';

export function repairJson(input: string): string {
  try {
    return jsonrepair(input);
  } catch {
    return input;
  }
}
