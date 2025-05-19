import { useRef, useEffect } from "react";

const ScrollableRow = ({ children }) => {
  const scrollRef = useRef();

  useEffect(() => {
    const container = scrollRef.current;
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto pb-4 px-3.5"
      
    >
      <div className="flex gap-2 whitespace-nowrap">
        {children}
      </div>
    </div>
  );
};

export default ScrollableRow;
