import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { DataTable } from "@/components/data-table";
import { columns, type Transaction } from "@/components/column";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Transactions() {
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const status = searchParams.get("status");
    const collectRequestId = searchParams.get("collectRequestId");

    if (status && collectRequestId) {
      if (status === "SUCCESS") {
        toast.success("Payment successful!");
      } else if (status === "FAILED") {
        toast.error("Payment failed. Please try again.");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch all transactions
        const response = await axios.get(
          "https://task-z1yc.onrender.com/api/transactions/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("API Response:", response.data);

        // Transform the API data to match the Transaction type
        const transformedData: Transaction[] = response.data.map((item: any, index: number) => {
          // Handle different response structures
          const orderInfo = item.order_info || item;
          const studentInfo = orderInfo.student_info || {};
          
          return {
            id: index + 1,
            instituteNo: orderInfo.school_id || 'N/A',
            dateTime: new Date(item.createdAt || orderInfo.createdAt).toLocaleString(),
            orderId: item.gateway_order_id || orderInfo.gateway_order_id || 'N/A',
            orderAmt: `₹${(item.order_amount || orderInfo.order_amount || 0).toLocaleString('en-IN')}`,
            txnAmt: `₹${(item.transaction_amount || 0).toLocaleString('en-IN')}`,
            method: item.payment_mode || 'Unknown',
            status: item.status === 'SUCCESS' ? 'Success' : 
                   item.status === 'PENDING' ? 'Pending' : 'Failed',
            student: studentInfo.name || 'N/A',
            phone: studentInfo.phone || 'N/A'
          };
        });

        setTransactions(transformedData);
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError(err.response?.data?.message || "Failed to load transactions");
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate pagination details
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  console.log("Transactions:", transactions);

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, transactions.length)} of {transactions.length} transactions
        </div>
      </div>
      
      <DataTable columns={columns} data={currentItems} />
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => paginate(number)}
            >
              {number}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Transactions;