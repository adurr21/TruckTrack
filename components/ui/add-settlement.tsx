"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setSupabase(createClient());
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId || !supabase) return setError("You must be signed in.");
    if (
      !form.date ||
      fields.some(
        ([name]) => name !== "date" && name !== "pay" && !form[name].trim(),
      ) ||
      !Number.isFinite(Number(form.pay)) ||
      Number(form.pay) < 0 ||
      fields.some(([name]) => name !== "date" && form[name].length > 100)
    )
      return setError(
        "Complete all fields with valid values under 100 characters.",
      );
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
    <Modal isOpen={open} onOpenChange={setOpen} size="lg">
      <ModalContent>
        <ModalHeader>New Settlement</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {error && (
                <p role="alert" className="text-danger">
                  {error}
                </p>
              )}
              {fields.map(([name, label]) => (
                <Input
                  key={name}
                  id={`settlement-${name}`}
                  type={
                    name === "date"
                      ? "date"
                      : name === "pay"
                        ? "number"
                        : "text"
                  }
                  label={label}
                  name={name}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required
                  step={name === "pay" ? "0.01" : undefined}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="default"
              variant="light"
              isDisabled={loading}
              onPress={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
