"use client";

import * as React from "react";
import { Chip, ChipProps } from "@heroui/react";

const Badge = React.forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
  <Chip ref={ref} {...props} />
));

Badge.displayName = "Badge";

export { Badge };
