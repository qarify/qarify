import { getPrettyFormatter } from '@logtape/pretty';
export const TZ = process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
export const prettyFormatter = getPrettyFormatter({
  timestamp: 'time',
  timeZone: TZ,
  categoryWidth: 20,
  icons: false,
  inspectOptions: { depth: 5, colors: true },
});
