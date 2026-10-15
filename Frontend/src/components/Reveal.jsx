import { forwardRef, useEffect, useRef, useState } from "react";

/* Adds the "reveal" fade-up and switches to "in" the first time the element scrolls into view. */
const Reveal = forwardRef(function Reveal(
  { as: Tag = "div", className = "", children, ...rest },
  outerRef,
) {
  const innerRef = useRef(null);
  const [seen, setSeen] = useState(false);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof outerRef === "function") outerRef(node);
    else if (outerRef) outerRef.current = node;
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el || seen) return undefined;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={setRefs}
      className={["reveal", seen ? "in" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Reveal;
