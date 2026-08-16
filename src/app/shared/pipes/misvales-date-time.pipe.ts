import { Pipe, PipeTransform } from '@angular/core';

const FORMATTER = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Monterrey',
});

@Pipe({
  name: 'misvalesDateTime',
  standalone: true,
})
export class MisvalesDateTimePipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : FORMATTER.format(date);
  }
}
