"use client";

import React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none${className ? ` ${className}` : ""}`}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
