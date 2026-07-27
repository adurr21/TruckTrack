"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Sheet,
  Table,
  IconButton,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/joy";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Settlement } from "@/types/database";
import AddSettlementModal from "@/components/ui/add-settlement";
import ExportCSVButton from "@/components/export-csv";

const PAGE_SIZE = 12;
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

export default function Dashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageCount = Math.ceil(total / PAGE_SIZE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setUserId(null);
      setData([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setUserId(auth.user.id);
    const from = page * PAGE_SIZE;
    const {
      data: rows,
      count,
      error: queryError,
    } = await supabase
      .from("settlements")
      .select("*", { count: "exact" })
      .eq("user_id", auth.user.id)
      .order("date", { ascending: true })
      .order("sheet_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (queryError) setError("Could not load settlements.");
    else {
      setData(rows ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, supabase]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (pageCount > 0 && page >= pageCount) setPage(pageCount - 1);
  }, [page, pageCount]);

  const handleDelete = async () => {
    if (!deleteId || !userId || deleting) return;
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

  return (
    <section className="flex flex-col items-center">
      <h1 className="mb-10 text-center">TruckTrack Dashboard</h1>
      <div className="mb-10 flex gap-5">
        <Button
          sx={{ width: 150 }}
          onClick={() => setOpen(true)}
          disabled={!userId}
        >
          Create Job Entry
        </Button>
        <ExportCSVButton data={data} filename="settlements.csv" />
      </div>
      {error && (
        <Typography color="danger" role="alert" className="mb-4">
          {error}
        </Typography>
      )}
      <Sheet variant="soft" color="neutral" sx={{ p: 2, maxWidth: "100%" }}>
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table
            aria-label="settlements table"
            stickyHeader
            sx={{ minWidth: 1000 }}
          >
            <thead>
              <tr>
                {[
                  "Date",
                  "Truck #",
                  "Dollie #",
                  "To",
                  "From",
                  "Pro No",
                  "Trailer #",
                  "Pay Sheet #",
                  "Gross Pay",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10}>Loading settlements…</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.sheet_id}>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.truck_num}</td>
                    <td>{row.dollie_num}</td>
                    <td>{row.to}</td>
                    <td>{row.from}</td>
                    <td>{row.pro_no}</td>
                    <td>{row.trailer_num}</td>
                    <td>{row.paysheet_num}</td>
                    <td>${row.pay.toFixed(2)}</td>
                    <td>
                      <IconButton
                        aria-label={`Delete settlement ${row.sheet_id}`}
                        color="danger"
                        disabled={deleting}
                        onClick={() => {
                          setDeleteId(row.sheet_id);
                          setConfirmOpen(true);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={10}>No settlements yet.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      </Sheet>
      <div className="mt-4 flex flex-col items-center justify-center">
        <span>
          {pageCount ? `Page ${page + 1} of ${pageCount}` : "No pages"}
        </span>
        <div className="my-2 flex gap-2">
          <Button
            disabled={page === 0 || !pageCount}
            onClick={() => setPage(0)}
          >
            First Page (Oldest)
          </Button>
          <Button
            disabled={page === 0 || !pageCount}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            disabled={!pageCount || page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Button>
          <Button
            disabled={!pageCount || page >= pageCount - 1}
            onClick={() => setPage(pageCount - 1)}
          >
            Last Page (Newest)
          </Button>
        </div>
      </div>
      <AddSettlementModal
        open={open}
        setOpen={setOpen}
        userId={userId}
        onCreated={fetchData}
      />
      <Modal
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm deletion</DialogTitle>
          <DialogContent>
            This settlement will be permanently deleted.
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </section>
  );
}
