"use client";

import * as React from "react";
import { Chip, ChipProps } from "@heroui/react";

const Badge = React.forwardRef<
  HTMLDivElement,
  ChipProps
>(({ className, ...props }, ref) => (
  <Chip
    ref={ref}
    {...props}
  />
));

Badge.displayName = "Badge";

export { Badge };
