import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const SanitizedHTML = ({ html }) => {
  const [sanitized, setSanitized] = useState("");

  useEffect(() => {
    setSanitized(DOMPurify.sanitize(html || ""));
  }, [html]);

  return React.createElement("div", {
    dangerouslySetInnerHTML: { __html: sanitized },
  });
};

export default SanitizedHTML;