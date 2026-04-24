import { useState } from "react";

/**
 * Props for the {@link CopyableLink} component.
 */
export interface CopyableLinkProps {
  /** The url to be copied to clipboard. */
  url: string;

  /** The string to display on the page that the user clicks to copy.
   *
   * @defaultValue {@link url}
   */
  display?: string;
}

/**
 * A link that appears as text and can be clicked to copy the text to a user's clipboard.
 *
 * @param props - The component props.
 */
const CopyableLink = ({ url, display }: CopyableLinkProps) => {
  const [copied, setCopied] = useState(false);

  // Copies the URL to the clipboard and shows a "Copied" state for 1.5 seconds
  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="unstyledButton copyableLink" onClick={handleCopy} title="Click to copy link">
      {copied ? "Copied" : (display ?? url)}
    </button>
  );
};

export default CopyableLink;
