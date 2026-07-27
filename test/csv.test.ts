import { describe, expect, it } from "vitest";
import { escapeCsvValue, settlementsToCsv } from "@/components/export-csv";
const row = {
  sheet_id: "1",
  user_id: "u",
  date: "2026-01-01",
  truck_num: "=SUM(1,1)",
  dollie_num: "x",
  to: "A, B",
  from: "line\nbreak",
  pro_no: "null",
  trailer_num: "t",
  paysheet_num: "p",
  pay: 12.5,
  created_at: "",
};
describe("CSV export", () => {
  it("quotes and neutralizes formula values", () => {
    expect(escapeCsvValue('a"b')).toBe('"a""b"');
    expect(settlementsToCsv([row])).toContain("'=SUM(1,1)");
    expect(settlementsToCsv([row])).toContain("\uFEFF");
  });
});
