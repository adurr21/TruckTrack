"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
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
import { ArrowDown, ArrowUp, Ellipsis, Trash2 } from "lucide-react";
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
type FilterKey = SortKey;
type ColumnFilters = Record<FilterKey, string>;
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

const EMPTY_FILTERS: ColumnFilters = {
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

const TRUNCATION_LIMITS: Record<FilterKey, number> = {
  date: 12,
  truck_num: 10,
  dollie_num: 10,
  to: 18,
  from: 18,
  pro_no: 12,
  trailer_num: 12,
  paysheet_num: 14,
  pay: 16,
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<Settlement[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Settlement | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ColumnFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      setUserId(null);
      setData([]);
      setLoading(false);
      if (authError) setError("Could not verify your session.");
      return;
    }
    setUserId(auth.user.id);
    const { data: rows, error: queryError } = await supabase
      .from("settlements")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("date", { ascending: false })
      .order("sheet_id", { ascending: true });
    if (queryError) setError("Could not load settlements.");
    else setData(rows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return data.filter((row) => {
      const values = {
        date: formatDate(row.date),
        truck_num: row.truck_num,
        dollie_num: row.dollie_num,
        to: row.to,
        from: row.from,
        pro_no: row.pro_no,
        trailer_num: row.trailer_num,
        paysheet_num: row.paysheet_num,
        pay: String(row.pay),
      } satisfies Record<FilterKey, string>;
      const matchesSearch =
        !normalizedSearch ||
        Object.values(values).some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) =>
          !value.trim() ||
          values[key as FilterKey]
            .toLowerCase()
            .includes(value.trim().toLowerCase()),
      );
      return matchesSearch && matchesFilters;
    });
  }, [data, filters, search]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const comparison =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue), undefined, {
              numeric: true,
              sensitivity: "base",
            });
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortOrder]);

  const pageCount = Math.ceil(sortedData.length / PAGE_SIZE);
  const visibleData = sortedData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage((currentPage) =>
      pageCount > 0 ? Math.min(currentPage, pageCount) : 1,
    );
  }, [pageCount]);

  const updateFilter = (key: FilterKey, value: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    setSortOrder(sortBy === key && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(key);
    setPage(1);
  };
  const handleDelete = async () => {
    if (!deleteId || !userId || deleting) return;
    const supabase = createClient();
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
    setData((currentData) =>
      currentData.filter((settlement) => settlement.sheet_id !== deleteId),
    );
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
  const getDisplayValues = (row: Settlement) => ({
    date: formatDate(row.date),
    truck_num: row.truck_num,
    dollie_num: row.dollie_num,
    to: row.to,
    from: row.from,
    pro_no: row.pro_no,
    trailer_num: row.trailer_num,
    paysheet_num: row.paysheet_num,
    pay: USD_FORMATTER.format(row.pay),
  });
  const hasTruncatedValue = (row: Settlement) => {
    const values = getDisplayValues(row);
    return (Object.keys(TRUNCATION_LIMITS) as FilterKey[]).some(
      (key) => values[key].length > TRUNCATION_LIMITS[key],
    );
  };
  const DetailCell = ({ row, value }: { row: Settlement; value: string }) => (
    <button
      type="button"
      className="block max-w-full truncate text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      title="Click to view the full value"
      onClick={(event) => {
        event.stopPropagation();
        setSelectedRow(row);
      }}
    >
      {value}
    </button>
  );
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
      <div className="flex w-full flex-col gap-3">
        <Input
          aria-label="Search settlements"
          className="mx-auto max-w-xl"
          label="Search all columns"
          placeholder="Search by truck, destination, pay, or any other value"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          isClearable
          onClear={() => {
            setSearch("");
            setPage(1);
          }}
        />
        <div className="flex justify-center gap-3">
          <Button
            variant="flat"
            onPress={() => setShowFilters((shown) => !shown)}
          >
            {showFilters ? "Hide column filters" : "Show column filters"}
          </Button>
          {(search || Object.values(filters).some(Boolean)) && (
            <Button variant="light" onPress={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 rounded-lg bg-default-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(labels) as FilterKey[]).map((key) => (
              <Input
                key={key}
                aria-label={`Filter by ${labels[key]}`}
                label={labels[key]}
                placeholder={`Filter ${labels[key].toLowerCase()}`}
                value={filters[key]}
                onValueChange={(value) => updateFilter(key, value)}
              />
            ))}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="w-full rounded-lg shadow">
        <Table
          aria-label="settlements table"
          isStriped
          color="primary"
          selectionMode="none"
          onRowAction={(key) => {
            const row = data.find((settlement) => settlement.sheet_id === key);
            if (row) setSelectedRow(row);
          }}
          classNames={{
            base: "w-full",
            wrapper: "min-h-[620px] overflow-hidden",
            table: "w-full table-fixed",
            tr: "h-12 cursor-pointer",
            th: "bg-primary text-primary-foreground whitespace-nowrap text-xs uppercase",
            td: "h-12 max-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
          }}
        >
          <TableHeader>
            <TableColumn className="w-[9%]">
              <SortHeader column="date" label={labels.date} />
            </TableColumn>
            <TableColumn className="w-[8%]">
              <SortHeader column="truck_num" label={labels.truck_num} />
            </TableColumn>
            <TableColumn className="w-[8%]">
              <SortHeader column="dollie_num" label={labels.dollie_num} />
            </TableColumn>
            <TableColumn className="w-[14%]">
              <SortHeader column="to" label={labels.to} />
            </TableColumn>
            <TableColumn className="w-[14%]">
              <SortHeader column="from" label={labels.from} />
            </TableColumn>
            <TableColumn className="w-[9%]">
              <SortHeader column="pro_no" label={labels.pro_no} />
            </TableColumn>
            <TableColumn className="w-[10%]">
              <SortHeader column="trailer_num" label={labels.trailer_num} />
            </TableColumn>
            <TableColumn className="w-[11%]">
              <SortHeader column="paysheet_num" label={labels.paysheet_num} />
            </TableColumn>
            <TableColumn className="w-[10%]">
              <SortHeader column="pay" label={labels.pay} />
            </TableColumn>
            <TableColumn className="w-[7%]">Actions</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              loading
                ? "Loading settlements…"
                : sortedData.length === 0 &&
                    (search || Object.values(filters).some(Boolean))
                  ? "No settlements match the current filters."
                  : "No job entries yet. Create one to get started."
            }
          >
            {visibleData.map((row) => (
              <TableRow key={row.sheet_id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-1">
                    <DetailCell row={row} value={getDisplayValues(row).date} />
                    {hasTruncatedValue(row) && (
                      <span
                        className="shrink-0 text-warning"
                        title="Some values in this row are shortened. Click a value to view the full details."
                        aria-label="Some values in this row are shortened"
                      >
                        <Ellipsis aria-hidden="true" size={16} />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DetailCell
                    row={row}
                    value={getDisplayValues(row).truck_num}
                  />
                </TableCell>
                <TableCell>
                  <DetailCell
                    row={row}
                    value={getDisplayValues(row).dollie_num}
                  />
                </TableCell>
                <TableCell>
                  <DetailCell row={row} value={getDisplayValues(row).to} />
                </TableCell>
                <TableCell>
                  <DetailCell row={row} value={getDisplayValues(row).from} />
                </TableCell>
                <TableCell>
                  <DetailCell row={row} value={getDisplayValues(row).pro_no} />
                </TableCell>
                <TableCell>
                  <DetailCell
                    row={row}
                    value={getDisplayValues(row).trailer_num}
                  />
                </TableCell>
                <TableCell>
                  <DetailCell
                    row={row}
                    value={getDisplayValues(row).paysheet_num}
                  />
                </TableCell>
                <TableCell>
                  <DetailCell row={row} value={getDisplayValues(row).pay} />
                </TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    aria-label={`Delete settlement ${row.sheet_id}`}
                    color="danger"
                    variant="light"
                    isDisabled={deleting}
                    onClick={(event) => event.stopPropagation()}
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
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, sortedData.length)}–
              {Math.min(page * PAGE_SIZE, sortedData.length)} of{" "}
              {sortedData.length}
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
      <Modal
        isOpen={Boolean(selectedRow)}
        size="2xl"
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Settlement details</ModalHeader>
          <ModalBody>
            {selectedRow && (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-default-500">Date</dt>
                  <dd className="break-words font-medium">
                    {formatDate(selectedRow.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-default-500">Gross Pay</dt>
                  <dd className="break-words font-medium">
                    {USD_FORMATTER.format(selectedRow.pay)}
                  </dd>
                </div>
                {(
                  [
                    ["Truck #", selectedRow.truck_num],
                    ["Dollie #", selectedRow.dollie_num],
                    ["To", selectedRow.to],
                    ["From", selectedRow.from],
                    ["Pro No", selectedRow.pro_no],
                    ["Trailer #", selectedRow.trailer_num],
                    ["Pay Sheet #", selectedRow.paysheet_num],
                    ["Sheet ID", selectedRow.sheet_id],
                    [
                      "Created",
                      new Date(selectedRow.created_at).toLocaleString(),
                    ],
                    ["User ID", selectedRow.user_id],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-default-500">{label}</dt>
                    <dd className="break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setSelectedRow(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
