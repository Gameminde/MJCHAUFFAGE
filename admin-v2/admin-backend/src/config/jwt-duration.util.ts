export class JwtDurationUtil {
  /**
   * Convert a duration (e.g. "15m", "7d") or numeric value to seconds.
   */
  static toSeconds(duration: string | number): number {
    if (typeof duration === 'number') {
      return duration;
    }

    const match = duration.trim().match(/^(\d+)([smhd])$/i);
    if (!match) {
      throw new Error(
        `Invalid JWT duration format "${duration}". Expected formats like "15m", "7d".`,
      );
    }

    const [, value, unit] = match;
    const amount = Number(value);
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24,
    };

    return amount * multipliers[unit.toLowerCase()];
  }
}
