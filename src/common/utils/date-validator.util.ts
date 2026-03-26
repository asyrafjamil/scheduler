import { BadRequestException } from '@nestjs/common';

/**
 * Validates multiple date parameters are not in the past
 * @param dates - Object with date field names as keys and date values
 * @throws BadRequestException if any date is in the past
 */
export function validateDatesNotPast(
  dates: Record<string, string | Date | undefined>,
): void {
  const now = new Date();

  for (const [, date] of Object.entries(dates)) {
    if (!date) continue; // Skip undefined/null dates

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (dateObj < now) {
      throw new BadRequestException(
        `Date parameters cannot be in the past. Please provide future dates.`,
      );
    }
  }
}
