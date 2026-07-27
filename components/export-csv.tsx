"use client";
import { Button } from "@mui/joy";
import type { Settlement } from "@/types/database";

export const SETTLEMENT_CSV_COLUMNS: Array<[keyof Settlement, string]> = [
  ["date", "Date"],
  ["truck_num", "Truck #"],
  ["dollie_num", "Dollie #"],
  ["to", "To"],
  ["from", "From"],
  ["pro_no", "Pro No"],
  ["trailer_num", "Trailer #"],
  ["paysheet_num", "Pay Sheet #"],
  ["pay", "Gross Pay"],
];
export function escapeCsvValue(value: unknown) {
  const text = value == null ? "" : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function settlementsToCsv(data: Settlement[]) {
  return `\uFEFF${SETTLEMENT_CSV_COLUMNS.map(([, header]) => escapeCsvValue(header)).join(",")}\n${data.map((row) => SETTLEMENT_CSV_COLUMNS.map(([key]) => escapeCsvValue(key === "pay" ? row.pay.toFixed(2) : row[key])).join(",")).join("\n")}`;
}
type Props = { data: Settlement[]; filename?: string };
export default function ExportCSVButton({
  data,
  filename = "data.csv",
}: Props) {
  const exportToCSV = () => {
    if (!data.length) return;
    const blob = new Blob([settlementsToCsv(data)], {
      type: "text/csv;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <Button
      sx={{ width: 150 }}
      color="success"
      disabled={!data.length}
      onClick={exportToCSV}
    >
      Export to CSV
    </Button>
  );
}
