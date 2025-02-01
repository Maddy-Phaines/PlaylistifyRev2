import React, { useEffect, useState } from "react";
import "./panel.css"; // Make sure to include the CSS file for styling

const Panel = ({ children, className = "", delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setVisible(true); // Trigger visibility on mount
    }, delay);

    return () => {
      clearTimeout(timeOut);
    };
  }, [delay]);

  return (
    <div
      delay={delay}
      className={`panel ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Panel;
