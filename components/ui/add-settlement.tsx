"use client";
import {
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Box,
  Button,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SettlementInsert } from "@/types/database";

const initialForm = {
  date: "",
  truck_num: "",
  dollie_num: "",
  to: "",
  from: "",
  pro_no: "",
  trailer_num: "",
  paysheet_num: "",
  pay: "",
};
const fields = [
  ["date", "Date"],
  ["truck_num", "Truck #"],
  ["dollie_num", "Dollie #"],
  ["to", "To"],
  ["from", "From"],
  ["pro_no", "Pro No"],
  ["trailer_num", "Trailer #"],
  ["paysheet_num", "Pay Sheet #"],
  ["pay", "Gross Pay"],
] as const;
const MAX = 100;
type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  userId: string | null;
  onCreated?: () => Promise<void>;
};

export default function AddSettlementModal({
  open,
  setOpen,
  userId,
  onCreated,
}: Props) {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  useEffect(() => {
    setSupabase(createClient());
  }, []);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId || !supabase) return setError("You must be signed in.");
    if (
      !form.date ||
      fields.some(
        ([name]) => name !== "date" && name !== "pay" && !form[name].trim(),
      ) ||
      Number.isNaN(Number(form.pay)) ||
      !Number.isFinite(Number(form.pay)) ||
      Number(form.pay) < 0
    )
      return setError("Complete all fields with a valid non-negative amount.");
    if (fields.some(([name]) => name !== "pay" && form[name].length > MAX))
      return setError(`Text fields must be ${MAX} characters or fewer.`);
    setLoading(true);
    const payload: SettlementInsert = {
      user_id: userId,
      date: form.date,
      truck_num: form.truck_num.trim(),
      dollie_num: form.dollie_num.trim(),
      to: form.to.trim(),
      from: form.from.trim(),
      pro_no: form.pro_no.trim(),
      trailer_num: form.trailer_num.trim(),
      paysheet_num: form.paysheet_num.trim(),
      pay: Number(form.pay),
    };
    const { error: insertError } = await supabase
      .from("settlements")
      .insert(payload);
    setLoading(false);
    if (insertError) return setError("Could not save settlement.");
    setForm(initialForm);
    setOpen(false);
    await onCreated?.();
  };
  return (
    <Modal open={open} onClose={() => !loading && setOpen(false)}>
      <ModalDialog
        aria-labelledby="create-job"
        aria-describedby="create-job-description"
        layout="center"
        sx={{ width: 500, maxHeight: "90vh", overflowY: "auto" }}
      >
        <Typography id="create-job" level="h4">
          New Settlement
        </Typography>
        <Typography id="create-job-description">
          Enter the details for this settlement.
        </Typography>
        {error && (
          <Typography color="danger" role="alert">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Box display="grid" gap={1.5}>
            {fields.map(([name, label]) => (
              <FormControl key={name}>
                <FormLabel htmlFor={`settlement-${name}`}>{label}</FormLabel>
                <Input
                  id={`settlement-${name}`}
                  type={
                    name === "date"
                      ? "date"
                      : name === "pay"
                        ? "number"
                        : "text"
                  }
                  inputMode={name === "pay" ? "decimal" : undefined}
                  name={name}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required
                />
              </FormControl>
            ))}
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                type="button"
                variant="plain"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
}
