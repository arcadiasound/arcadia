import { useState } from "react";

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string>();

  function oldSchoolCopy(text) {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
  }

  //   const copyToClipboard = useCallback((value) => {
  const copyToClipboard = async (value: string) => {
    if (isCopied) {
      return;
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopiedText(value);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } else {
        throw new Error("writeText not supported");
      }
    } catch (error) {
      oldSchoolCopy(value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  // handleCopy();
  //   }, []);

  return {
    isCopied,
    copiedText,
    copyToClipboard,
  };
};
