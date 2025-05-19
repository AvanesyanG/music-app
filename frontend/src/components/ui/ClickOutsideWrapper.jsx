import { useEffect, useRef } from "react";

 const ClickOutsideWrapper = ({ onClickOutside, children }) => {
  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClickOutside(); // Trigger the onClickOutside callback
      }
    };

    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside]);

  return <div ref={wrapperRef}>{children}</div>;
};

export default ClickOutsideWrapper;


