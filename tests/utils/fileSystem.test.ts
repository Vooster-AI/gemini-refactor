import { countChars } from '../../src/utils/fileSystem';

describe('fileSystem utils', () => {
  it('countChars는 문자열 길이를 반환해야 한다', () => {
    expect(countChars('abc')).toBe(3);
  });
});
