export default function Marquee({ items }) {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) =>
          items.map((t, i) => <span key={k + "-" + i}>{t}</span>),
        )}
      </div>
    </div>
  );
}
