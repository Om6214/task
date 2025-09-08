import { DataTable } from "@/components/data-table"
import { columns, type Transaction } from "@/components/column"

function Transactions() {
    // Mock data
    const data: Transaction[] = [
        {
            id: 1,
            instituteNo: "INST-001",
            dateTime: "2025-09-08 14:30",
            orderId: "ORD-12345",
            orderAmt: "₹5,000",
            txnAmt: "₹4,950",
            method: "UPI",
            status: "Success",
            student: "Rahul Sharma",
            phone: "9876543210",
        },
        {
            id: 2,
            instituteNo: "INST-002",
            dateTime: "2025-09-08 15:10",
            orderId: "ORD-12346",
            orderAmt: "₹2,500",
            txnAmt: "₹2,500",
            method: "Card",
            status: "Pending",
            student: "Anjali Mehta",
            phone: "9123456789",
        },
        {
            id: 3,
            instituteNo: "INST-003",
            dateTime: "2025-09-08 15:45",
            orderId: "ORD-12347",
            orderAmt: "₹7,000",
            txnAmt: "₹6,950",
            method: "NetBanking",
            status: "Failed",
            student: "Suresh Kumar",
            phone: "9988776655",
        },
        {
            id: 4,
            instituteNo: "INST-004",
            dateTime: "2025-09-08 16:00",
            orderId: "ORD-12348",
            orderAmt: "₹3,500",
            txnAmt: "₹3,500",
            method: "Cash",
            status: "Success",
            student: "Priya Singh",
            phone: "9012345678",
        },
        {
            id: 5,
            instituteNo: "INST-005",
            dateTime: "2025-09-08 16:20",
            orderId: "ORD-12349",
            orderAmt: "₹10,000",
            txnAmt: "₹9,900",
            method: "UPI",
            status: "Pending",
            student: "Vikas Patil",
            phone: "9765432109",
        },
    ]

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}

export default Transactions
