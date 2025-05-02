'use client'

import {
    Modal,
    ModalDialog,
    FormControl,
    FormLabel,
    Input,
    Typography,
    Box,
    Button,
} from '@mui/joy'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const initialForm = {
    date: '',
    truck_num: '',
    dollie_num: '',
    to: '',
    from: '',
    pro_no: '',
    trailer_num: '',
    paysheet_num: '',
    pay: '',
}

interface Props {
    open: boolean
    setOpen: (value: boolean) => void
    userId: string | null
}

export default function AddSettlementModal({ open, setOpen, userId }: Props) {
    const supabase = createClient()
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('settlements').insert([
            {
                ...form,
                user_id: userId,
                date: new Date(form.date).toISOString(),
                pay: parseFloat(form.pay),
            },
        ])

        if (!error) {
            setForm(initialForm)
            setOpen(false)
        }

        setLoading(false)
    }

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog aria-labelledby="create-job" layout="center" sx={{ width: 500, maxHeight: '90vh', overflowY: 'auto', scrollPaddingBottom: 'env(safe-area-inset-bottom)' }}>
                <Typography id="create-job" level="h4" mb={1}>
                    New Settlement
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box display="grid" gap={1.5}>
                        {[
                            ['date', 'Date'],
                            ['truck_num', 'Truck #'],
                            ['dollie_num', 'Dollie #'],
                            ['to', 'To'],
                            ['from', 'From'],
                            ['pro_no', 'Pro No'],
                            ['trailer_num', 'Trailer #'],
                            ['paysheet_num', 'Pay Sheet #'],
                            ['pay', 'Gross Pay'],
                        ].map(([name, label]) => (
                            <FormControl key={name}>
                                <FormLabel>{label}</FormLabel>
                                <Input
                                    type={name === 'date' ? 'date' : name === 'pay' ? 'number' : 'text'}
                                    name={name}
                                    value={(form as any)[name]}
                                    onChange={handleChange}
                                    required
                                />
                            </FormControl>
                        ))}
                        <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                            <Button type="button" variant="plain" color="neutral" onClick={() => setOpen(false)}>
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
    )
}
