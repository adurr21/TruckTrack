"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { createClient } from "@/utils/supabase/client";

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

export default function NewDashboardEntryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      setLoading(false);
      setError("You must be signed in to create an entry.");
      return;
    }

    const { error: insertError } = await supabase.from("settlements").insert([
      {
        ...form,
        user_id: user.id,
        pay: Number.parseFloat(form.pay),
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message || "Could not create entry.");
      return;
    }

    router.push("/protected/dashboard");
    router.refresh();
  };

  return (
    <section className="w-full max-w-2xl mx-auto py-6">
      <Card shadow="sm" className="border border-default-200">
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <h1 className="text-2xl font-semibold">Create Job Entry</h1>
          <p className="text-sm text-foreground/70">
            Add a new settlement record for your dashboard.
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(([name, label]) => (
                <Input
                  key={name}
                  type={name === "date" ? "date" : name === "pay" ? "number" : "text"}
                  label={label}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  step={name === "pay" ? "0.01" : undefined}
                />
              ))}
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button as={Link} href="/protected/dashboard" variant="light">
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading}>
                Save Entry
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
}
