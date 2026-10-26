// Generates a loud two-tone siren with the Web Audio API — no audio file to
// host, and it plays as loud as the device volume allows. This only works
// while the pantry tab is open and audio is unblocked (the browser requires
// at least one prior user gesture on the page, e.g. tapping "Enable
// alerts"); for when the tab/app is closed or the screen is locked, see the
// Web Push setup in src/lib/push.ts instead — that reaches the device but
// can only trigger the phone's own notification sound, not this siren.
export function playWaterAlarm() {
  try {
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();

    const TONE_HIGH = 880;
    const TONE_LOW = 587;
    const BEEP_MS = 220;
    const GAP_MS = 90;
    const REPEATS = 4;

    let t = ctx.currentTime;
    for (let i = 0; i < REPEATS; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = i % 2 === 0 ? TONE_HIGH : TONE_LOW;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
      gain.gain.setValueAtTime(0.5, t + BEEP_MS / 1000 - 0.02);
      gain.gain.linearRampToValueAtTime(0, t + BEEP_MS / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + BEEP_MS / 1000);
      t += (BEEP_MS + GAP_MS) / 1000;
    }

    // Tear the context down once the pattern finishes instead of leaking
    // one AudioContext per alert.
    setTimeout(() => ctx.close().catch(() => {}), (BEEP_MS + GAP_MS) * REPEATS + 200);
  } catch {
    // Audio blocked (no user gesture yet) or unsupported — the visual
    // alert on screen still gets the message across.
  }
}
