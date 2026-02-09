import { useState } from "react";

// Future-proofing for later
// Used to make links in homepage table easily copyable

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
    <span
      className="copyableLink"
      onClick={handleCopy}
      title="Click to copy link"
    >
      {copied ? "Copied" : url}
    </span>
  );
};

export default CopyableLink;
