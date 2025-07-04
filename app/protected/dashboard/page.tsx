"use client"

import { useEffect, useState } from 'react'
import { Box, Button, Sheet, Table, IconButton, Modal, ModalDialog, DialogTitle, DialogActions } from '@mui/joy'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import AddSettlementModal from '@/components/ui/add-settlement'
import ExportCSVButton from '@/components/export-csv'

const PAGE_SIZE = 12;

export default function Dashboard() {
    const supabase = createClient()
    const [data, setData] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [page, setPage] = useState(0);

    function formatDate(date: String) {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`
    }

    const fetchData = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        setUserId(user?.id ?? null)

        if (user?.id) {
            const { data, error } = await supabase
                .from('settlements')
                .select('*')
                .eq('user_id', user.id)

            if (!error) setData(data)
        }
    }

    useEffect(() => {
        fetchData()
    }, [open, confirmOpen])

    const handleDelete = async () => {
        console.warn("Deleting ID: ", deleteId);
        if (!deleteId) return
        const { error } = await supabase.from('settlements').delete().eq('sheet_id', deleteId)
        console.warn("Error: ", error)
        if (!error) {
            setConfirmOpen(false)
            setDeleteId(null)
        }
    }

    const pageCount = Math.ceil(data.length / PAGE_SIZE);
    const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <section className="flex items-center flex-col">
            <h1 className="text-center mb-10">TruckTrack Dashboard</h1>

            <div className='flex mb-10 gap-5'>
                <Button sx={{ width: '150px' }} color="neutral" onClick={() => setOpen(true)}>
                    Create Job Entry
                </Button>
                <ExportCSVButton data={data} filename='settlements.csv' />
            </div>


            <Sheet variant="soft" color="neutral" sx={{ p: 2, maxWidth: '100%' }}>
                <Box sx={{ overflowX: 'auto', width: '100%'}}>
                    <Table aria-label="settlements table" stickyHeader sx={{ minWidth: 1000, backgroundColor: 'Background.surface' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Truck #</th>
                                <th>Dollie #</th>
                                <th>To</th>
                                <th>From</th>
                                <th>Pro No</th>
                                <th>Trailer #</th>
                                <th>Pay Sheet #</th>
                                <th>Gross Pay</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData?.map((row) => (
                                <tr key={row.sheet_id}>
                                    <td>{formatDate(row.date)}</td>
                                    <td>{row.truck_num}</td>
                                    <td>{row.dollie_num}</td>
                                    <td>{row.to}</td>
                                    <td>{row.from}</td>
                                    <td>{row.pro_no}</td>
                                    <td>{row.trailer_num}</td>
                                    <td>{row.paysheet_num}</td>
                                    <td>$ {row.pay}</td>
                                    <td>
                                        <IconButton
                                            color="danger"
                                            onClick={() => {
                                                setDeleteId(row.sheet_id)
                                                setConfirmOpen(true)
                                            }}
                                        >
                                            <Trash2 />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Box>
            </Sheet>

            <div className='flex flex-col justify-center items-center mt-4'>
                <span>
                    Page {page + 1} of {pageCount}
                </span>
                <div className='flex justify-center items-center my-2 gap-2'>
                    <Button disabled={page === 0} sx={{ width: '150px' }} color="neutral" onClick={() => setPage(0)}>
                        First Page (Oldest Entries)
                    </Button>
                    <Button disabled={page === 0} sx={{ width: '75px' }} color="neutral" onClick={() => setPage(page - 1)}>
                        Prev
                    </Button>
                    <Button disabled={page === pageCount - 1} sx={{ width: '75px' }} color="neutral" onClick={() => setPage(page + 1)}>
                        Next
                    </Button>
                    <Button disabled={page === pageCount - 1} sx={{ width: '150px' }} color="neutral" onClick={() => setPage(pageCount - 1)}>
                        Last Page (Newest Entries)
                    </Button>
                </div>
            </div>

            <AddSettlementModal open={open} setOpen={setOpen} userId={userId} />

            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <ModalDialog>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogActions>
                        <Button variant="plain" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color="danger" onClick={handleDelete}>Delete</Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </section>
    )
}
