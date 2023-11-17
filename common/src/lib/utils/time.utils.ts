import ms  from 'ms';

export function isZeitMs(value: string) {
  try {
    ms(value);
    return true;
  } catch (error) {
    return false;
  }
}
