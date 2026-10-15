/* Pastel illustrations used on project cards (classes p1..p4 are coloured in index.css). */
const Svg = ({ children }) => (
  <svg
    viewBox="0 0 400 400"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {children}
  </svg>
);

function Cube({ cx, cy, s }) {
  const w = +(s * 0.87).toFixed(1);
  const h = +(s / 2).toFixed(1);
  return (
    <>
      <polygon
        className="p1"
        points={`${cx},${cy - s} ${cx + w},${cy - h} ${cx},${cy} ${cx - w},${cy - h}`}
      />
      <polygon
        className="p2"
        points={`${cx - w},${cy - h} ${cx},${cy} ${cx},${cy + s} ${cx - w},${cy + h}`}
      />
      <polygon
        className="p3"
        points={`${cx + w},${cy - h} ${cx},${cy} ${cx},${cy + s} ${cx + w},${cy + h}`}
      />
    </>
  );
}

const ARTS = {
  dashboard: (
    <Svg>
      <rect className="p4" x="52" y="96" width="132" height="236" rx="26" />
      <rect className="p1" x="118" y="76" width="156" height="256" rx="28" />
      <circle className="p2" cx="196" cy="128" r="22" />
      <rect className="p3" x="146" y="168" width="100" height="10" rx="5" />
      <rect className="p3" x="158" y="188" width="76" height="8" rx="4" />
      <rect className="p2" x="146" y="238" width="18" height="46" rx="6" />
      <rect className="p3" x="172" y="222" width="18" height="62" rx="6" />
      <rect className="p2" x="198" y="250" width="18" height="34" rx="6" />
      <rect className="p3" x="224" y="232" width="18" height="52" rx="6" />
      <rect className="p4" x="250" y="120" width="104" height="190" rx="24" />
      <circle className="p2" cx="278" cy="152" r="8" />
      <rect className="p1" x="268" y="180" width="66" height="9" rx="4.5" />
      <rect className="p1" x="268" y="200" width="48" height="9" rx="4.5" />
    </Svg>
  ),
  api: (
    <Svg>
      <rect className="p1" x="66" y="92" width="268" height="62" rx="22" />
      <circle className="p2" cx="100" cy="123" r="14" />
      <rect className="p3" x="128" y="112" width="120" height="9" rx="4.5" />
      <rect className="p3" x="128" y="130" width="80" height="8" rx="4" />
      <rect className="p4" x="66" y="172" width="268" height="62" rx="22" />
      <circle className="p2" cx="100" cy="203" r="14" />
      <rect className="p1" x="128" y="192" width="140" height="9" rx="4.5" />
      <rect className="p1" x="128" y="210" width="90" height="8" rx="4" />
      <rect className="p1" x="66" y="252" width="268" height="40" rx="20" />
      <rect className="p2" x="86" y="268" width="60" height="9" rx="4.5" />
      <rect className="p3" x="156" y="268" width="130" height="9" rx="4.5" />
    </Svg>
  ),
  chat: (
    <Svg>
      <rect className="p1" x="56" y="96" width="196" height="58" rx="29" />
      <circle className="p3" cx="92" cy="125" r="6" />
      <circle className="p3" cx="114" cy="125" r="6" />
      <circle className="p3" cx="136" cy="125" r="6" />
      <rect className="p2" x="148" y="172" width="196" height="58" rx="29" />
      <rect className="p1" x="176" y="196" width="110" height="9" rx="4.5" />
      <rect className="p4" x="56" y="248" width="150" height="46" rx="23" />
      <rect className="p1" x="82" y="267" width="90" height="8" rx="4" />
    </Svg>
  ),
  cubes: (
    <Svg>
      <Cube cx={205} cy={138} s={58} />
      <Cube cx={138} cy={216} s={50} />
      <Cube cx={272} cy={214} s={46} />
    </Svg>
  ),
  orbit: (
    <Svg>
      <circle className="p4" cx="200" cy="190" r="122" />
      <circle className="p1" cx="200" cy="190" r="86" />
      <circle className="p2" cx="200" cy="190" r="48" />
      <circle className="p3" cx="296" cy="124" r="14" />
      <circle className="p1" cx="108" cy="268" r="10" />
      <circle className="p3" cx="150" cy="96" r="7" />
    </Svg>
  ),
};

export default function Art({ name }) {
  return ARTS[name] || ARTS.dashboard;
}
