"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Copy, Check } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator?.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <pre className="bg-slate-900 rounded-md p-6 my-6 relative">
      <Button
        isIconOnly
        variant="flat"
        size="sm"
        onClick={copy}
        className="absolute right-2 top-2"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </Button>
      <code className="text-xs text-white p-3">{code}</code>
    </pre>
  );
}
