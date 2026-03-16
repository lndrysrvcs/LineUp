import { useState } from "react";

interface CopyableLinkProps {
  url: string;
}

const CopyableLink = ({ url }: CopyableLinkProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="unstyledButton copyableLink" onClick={handleCopy} title="Click to copy link">
      {copied ? "Copied" : url}
    </button>
  );
};

export default CopyableLink;
