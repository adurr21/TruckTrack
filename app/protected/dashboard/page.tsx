"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Settlement } from "@/types/database";
import ExportCSVButton from "@/components/export-csv";

const PAGE_SIZE = 12;
type SortKey =
  | "date"
  | "truck_num"
  | "dollie_num"
  | "to"
  | "from"
  | "pro_no"
  | "trailer_num"
  | "paysheet_num"
  | "pay";
type SortOrder = "asc" | "desc";
const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

export default function Dashboard() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  const [data, setData] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / PAGE_SIZE);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      setUserId(null);
      setData([]);
      setTotal(0);
      setLoading(false);
      if (authError) setError("Could not verify your session.");
      return;
    }
    setUserId(auth.user.id);
    const from = (page - 1) * PAGE_SIZE;
    const {
      data: rows,
      count,
      error: queryError,
    } = await supabase
      .from("settlements")
      .select("*", { count: "exact" })
      .eq("user_id", auth.user.id)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .order("sheet_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (queryError) setError("Could not load settlements.");
    else {
      setData(rows ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, sortBy, sortOrder, supabase]);

  useEffect(() => {
    setSupabase(createClient());
  }, []);
  useEffect(() => {
    void fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (pageCount > 0 && page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const handleSort = (key: SortKey) => {
    setSortOrder(sortBy === key && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(key);
    setPage(1);
  };
  const handleDelete = async () => {
    if (!supabase || !deleteId || !userId || deleting) return;
    setDeleting(true);
    setError(null);
    const { error: deleteError } = await supabase
      .from("settlements")
      .delete()
      .eq("sheet_id", deleteId)
      .eq("user_id", userId);
    setDeleting(false);
    if (deleteError) {
      setError("Could not delete settlement.");
      return;
    }
    setConfirmOpen(false);
    setDeleteId(null);
    void fetchData();
  };
  const SortHeader = ({
    column,
    label,
  }: {
    column: SortKey;
    label: string;
  }) => (
    <button
      type="button"
      aria-label={`Sort by ${label}`}
      onClick={() => handleSort(column)}
      className="flex items-center gap-2 font-semibold"
    >
      <span>{label}</span>
      {sortBy === column &&
        (sortOrder === "asc" ? (
          <ArrowUp aria-hidden="true" size={14} />
        ) : (
          <ArrowDown aria-hidden="true" size={14} />
        ))}
    </button>
  );

  const labels = {
    date: "Date",
    truck_num: "Truck #",
    dollie_num: "Dollie #",
    to: "To",
    from: "From",
    pro_no: "Pro No",
    trailer_num: "Trailer #",
    paysheet_num: "Pay Sheet #",
    pay: "Gross Pay",
  };
  return (
    <section className="flex flex-col items-center gap-6">
      <h1 className="text-center text-3xl font-bold">TruckTrack Dashboard</h1>
      <div className="flex gap-5">
        <Button
          color="primary"
          onPress={() => router.push("/protected/dashboard/new")}
          className="w-[150px]"
          isDisabled={!userId}
        >
          Create Job Entry
        </Button>
        <ExportCSVButton data={data} filename="settlements.csv" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="w-full overflow-x-auto rounded-lg shadow">
        <Table
          aria-label="settlements table"
          isStriped
          color="primary"
          selectionMode="none"
          classNames={{
            wrapper: "min-h-[200px]",
            th: "bg-primary text-primary-foreground text-xs uppercase",
          }}
        >
          <TableHeader>
            <TableColumn>
              <SortHeader column="date" label={labels.date} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="truck_num" label={labels.truck_num} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="dollie_num" label={labels.dollie_num} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="to" label={labels.to} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="from" label={labels.from} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="pro_no" label={labels.pro_no} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="trailer_num" label={labels.trailer_num} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="paysheet_num" label={labels.paysheet_num} />
            </TableColumn>
            <TableColumn>
              <SortHeader column="pay" label={labels.pay} />
            </TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              loading
                ? "Loading settlements…"
                : "No job entries yet. Create one to get started."
            }
          >
            {data.map((row) => (
              <TableRow key={row.sheet_id}>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>{row.truck_num}</TableCell>
                <TableCell>{row.dollie_num}</TableCell>
                <TableCell>{row.to}</TableCell>
                <TableCell>{row.from}</TableCell>
                <TableCell>{row.pro_no}</TableCell>
                <TableCell>{row.trailer_num}</TableCell>
                <TableCell>{row.paysheet_num}</TableCell>
                <TableCell>{USD_FORMATTER.format(row.pay)}</TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    aria-label={`Delete settlement ${row.sheet_id}`}
                    color="danger"
                    variant="light"
                    isDisabled={deleting}
                    onPress={() => {
                      setDeleteId(row.sheet_id);
                      setConfirmOpen(true);
                    }}
                  >
                    <Trash2 aria-hidden="true" size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center gap-3">
        {pageCount ? (
          <>
            <span className="text-sm">
              Page {page} of {pageCount}
            </span>
            <Pagination
              isCompact
              showControls
              color="primary"
              page={page}
              total={pageCount}
              onChange={setPage}
            />
          </>
        ) : (
          <span className="text-sm">No pages</span>
        )}
      </div>
      <Modal isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
        <ModalContent>
          <ModalHeader>Confirm deletion</ModalHeader>
          <ModalBody>
            <p>This settlement will be permanently deleted.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              isDisabled={deleting}
              onPress={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" isLoading={deleting} onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
