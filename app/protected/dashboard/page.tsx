"use client"

import { useEffect, useState } from 'react'
import {
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Pagination,
} from '@heroui/react'
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ExportCSVButton from '@/components/export-csv'
import { useRouter } from 'next/navigation'

const PAGE_SIZE = 12;
const USD_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

type SortKey = 'date' | 'truck_num' | 'dollie_num' | 'to' | 'from' | 'pro_no' | 'trailer_num' | 'paysheet_num' | 'pay';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [data, setData] = useState<any[]>([])
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState<SortKey>('date')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    function formatDate(date: String) {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`
    }

    function formatCurrency(value: unknown) {
        const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0));
        if (Number.isNaN(numericValue)) return USD_FORMATTER.format(0);
        return USD_FORMATTER.format(numericValue);
    }

    const fetchData = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (user?.id) {
            const { data, error } = await supabase
                .from('settlements')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })

            if (!error) setData(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async () => {
        console.warn("Deleting ID: ", deleteId);
        if (!deleteId) return
        const { error } = await supabase.from('settlements').delete().eq('sheet_id', deleteId)
        console.warn("Error: ", error)
        if (!error) {
            setConfirmOpen(false)
            setDeleteId(null)
            fetchData()
        }
    }

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(key)
            setSortOrder('asc')
        }
        setPage(1)
    }

    const getSortedData = () => {
        const sorted = [...data].sort((a, b) => {
            const aVal = a[sortBy]
            const bVal = b[sortBy]

            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1

            let comparison = 0
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal)
            } else {
                comparison = String(aVal).localeCompare(String(bVal))
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })
        return sorted
    }

    const SortHeader = ({ column, label }: { column: SortKey; label: string }) => {
        const isActive = sortBy === column
        return (
            <button
                onClick={() => handleSort(column)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
                <span>{label}</span>
                {isActive && (
                    sortOrder === 'asc' 
                        ? <ArrowUp size={14} /> 
                        : <ArrowDown size={14} />
                )}
            </button>
        )
    }

    const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const sortedData = getSortedData();
    const pageData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <section className="flex items-center flex-col gap-6">
            <h1 className="text-center text-3xl font-bold">TruckTrack Dashboard</h1>

            <div className='flex gap-5'>
                <Button 
                    color="primary" 
                    onPress={() => router.push('/protected/dashboard/new')}
                    className="w-[150px]"
                >
                    Create Job Entry
                </Button>
                <ExportCSVButton data={data} filename='settlements.csv' />
            </div>

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
                        <TableColumn><SortHeader column="date" label="Date" /></TableColumn>
                        <TableColumn><SortHeader column="truck_num" label="Truck #" /></TableColumn>
                        <TableColumn><SortHeader column="dollie_num" label="Dollie #" /></TableColumn>
                        <TableColumn><SortHeader column="to" label="To" /></TableColumn>
                        <TableColumn><SortHeader column="from" label="From" /></TableColumn>
                        <TableColumn><SortHeader column="pro_no" label="Pro No" /></TableColumn>
                        <TableColumn><SortHeader column="trailer_num" label="Trailer #" /></TableColumn>
                        <TableColumn><SortHeader column="paysheet_num" label="Pay Sheet #" /></TableColumn>
                        <TableColumn><SortHeader column="pay" label="Gross Pay" /></TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No job entries yet. Create one to get started.">
                        {pageData?.map((row) => (
                            <TableRow key={row.sheet_id}>
                                <TableCell>{formatDate(row.date)}</TableCell>
                                <TableCell>{row.truck_num}</TableCell>
                                <TableCell>{row.dollie_num}</TableCell>
                                <TableCell>{row.to}</TableCell>
                                <TableCell>{row.from}</TableCell>
                                <TableCell>{row.pro_no}</TableCell>
                                <TableCell>{row.trailer_num}</TableCell>
                                <TableCell>{row.paysheet_num}</TableCell>
                                <TableCell>{formatCurrency(row.pay)}</TableCell>
                                <TableCell>
                                    <Button 
                                        isIconOnly
                                        color="danger"
                                        variant="light"
                                        onPress={() => {
                                            setDeleteId(row.sheet_id)
                                            setConfirmOpen(true)
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className='flex flex-col justify-center items-center gap-3'>
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
            </div>

            <Modal isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete this entry?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" variant="light" onPress={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="danger" onPress={handleDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </section>
    )
}
