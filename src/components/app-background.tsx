/** Fixed layers: deep space base + purple nebula + procedural starfield (server-rendered — no client waterfall). */

function makeStarfieldDataUri(seed: number, density: number, dim: boolean): string {
  const circles: string[] = [];
  let s = seed >>> 0;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const fill = dim ? "rgba(255,255,255,0.55)" : "#fff";
  for (let i = 0; i < density; i++) {
    const x = rnd() * 512;
    const y = rnd() * 512;
    const r = (dim ? 0.35 : 0.5) + rnd() * (dim ? 0.9 : 1.1);
    const o = dim ? 0.12 + rnd() * 0.45 : 0.35 + rnd() * 0.65;
    circles.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${fill}" opacity="${o.toFixed(2)}"/>`,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${circles.join("")}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const STARFIELD_BRIGHT = makeStarfieldDataUri(0x2a7f1c3d, 72, false);
const STARFIELD_DIM = makeStarfieldDataUri(0x9e4b2a11, 96, true);

export function AppBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#030308]" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(30,27,45,0.55),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(15,23,42,0.35),transparent_50%),radial-gradient(ellipse_55%_45%_at_0%_100%,rgba(20,18,40,0.28),transparent_50%)]"
        aria-hidden
      />
      <div
        className="app-starfield pointer-events-none fixed inset-0 -z-20 opacity-[0.35]"
        style={{
          backgroundImage: `${STARFIELD_BRIGHT}, ${STARFIELD_DIM}`,
          backgroundSize: "720px 720px, 520px 520px",
          backgroundPosition: "0 0, 180px 240px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-transparent via-transparent to-[#030308]/90"
        aria-hidden
      />
    </>
  );
}
