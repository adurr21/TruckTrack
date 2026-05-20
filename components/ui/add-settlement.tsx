'use client'

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from '@heroui/react'
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
                date: form.date,
                pay: parseFloat(form.pay),
            },
        ])

        if (!error) {
            setForm(initialForm)
            setOpen(false)
        }

        setLoading(false)
    }

    const fields = [
        ['date', 'Date'],
        ['truck_num', 'Truck #'],
        ['dollie_num', 'Dollie #'],
        ['to', 'To'],
        ['from', 'From'],
        ['pro_no', 'Pro No'],
        ['trailer_num', 'Trailer #'],
        ['paysheet_num', 'Pay Sheet #'],
        ['pay', 'Gross Pay'],
    ] as const

    return (
        <Modal isOpen={open} onOpenChange={setOpen} size="lg">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">New Settlement</ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            {fields.map(([name, label]) => (
                                <Input
                                    key={name}
                                    type={name === 'date' ? 'date' : name === 'pay' ? 'number' : 'text'}
                                    label={label}
                                    name={name}
                                    value={(form as any)[name]}
                                    onChange={handleChange}
                                    required
                                    step={name === 'pay' ? '0.01' : undefined}
                                />
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" variant="light" onPress={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="primary" type="submit" isLoading={loading}>
                            Submit
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
