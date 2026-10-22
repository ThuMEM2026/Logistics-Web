// Planning estimate for a fresh, text-only Chinese narration task. No network calls.
export function estimateQuote(text, expectedMinutes) {
  if (typeof text !== 'string') throw new TypeError('讲稿必须为文本');
  if (!text.trim()) return null;
  const characters = Array.from(text).length;
  const han = Array.from(text).filter(c => /\p{Script=Han}/u.test(c)).length;
  if (!han) throw new RangeError('当前只校准了中文讲稿；外文费用需另测。');
  const minutes = Number(expectedMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new RangeError('请输入大于0的预计音频分钟数');
  // These observed ratios include the prompts in two prior tests. They are scenarios, not guaranteed bounds.
  const inputTokensLow = Math.ceil(characters * 710 / 1105);
  const inputTokensHigh = Math.ceil(characters * 138 / 118);
  const audioTokens = Math.ceil(minutes * 60) * 12.5;
  const outputAudioCny = audioTokens * 12 / 1e6;
  return {
    characters, han, minutes, inputTokensLow, inputTokensHigh, audioTokens, outputAudioCny,
    realtimeLow: outputAudioCny + inputTokensLow * 1.5 / 1e6,
    realtimeHigh: outputAudioCny + inputTokensHigh * 1.5 / 1e6,
    youdao: characters * 2 * 0.5 / 10000,
    requiresSplitting: inputTokensHigh > 16384 || audioTokens > 8192,
    cloneIncrementalCny: 0,
    basis: '中文单轮文字输入；预计音频时长、两条样本Token比例；非官方固定汉字价或保证上限。',
  };
}
