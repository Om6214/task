// src/pages/transactions/columns.tsx
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

// Define the transaction type
export type Transaction = {
  id: number
  instituteNo: string
  dateTime: string
  orderId: string
  orderAmt: string
  txnAmt: string
  method: string
  status: "Success" | "Pending" | "Failed"
  student: string
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Sr No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "instituteNo",
    header: "Institute No",
  },
  {
    accessorKey: "dateTime",
    header: "Date & Time",
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
  },
  {
    accessorKey: "orderAmt",
    header: "Order Amt",
  },
  {
    accessorKey: "txnAmt",
    header: "Txn Amt",
  },
  {
    accessorKey: "method",
    header: "Payment Method",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={
            status === "Success"
              ? "default"
              : status === "Pending"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "student",
    header: "Student Name",
  },
]
