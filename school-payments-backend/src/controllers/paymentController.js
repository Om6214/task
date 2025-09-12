import axios from "axios";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";
import WebhookLog from "../models/WebhookLog.js";

// ---------------------------
// 1. Create Payment
// ---------------------------
export const createPayment = async (req, res) => {
    try {
        const { amount, student_info, trustee_id, school_id } = req.body;

        // Debug environment variables and received data
        console.log("Env check:", {
            SCHOOL_ID: process.env.SCHOOL_ID,
            PG_KEY: process.env.PG_KEY,
            API_KEY: process.env.PAYMENT_API_KEY
        });
        console.log("Received school_id:", school_id);

        // Use the school_id from request body instead of environment variable
        const effectiveSchoolId = school_id || process.env.SCHOOL_ID;

        // 1️⃣ Save initial order in DB
        const order = await Order.create({
            school_id: effectiveSchoolId,
            trustee_id,
            student_info,
            gateway_name: "Edviron"
        });

        console.log("Created order:", order._id);

        // 2️⃣ Payload for Edviron API
        const payload = {
            school_id: effectiveSchoolId,
            amount: amount.toString(),
            callback_url: "https://task-z1yc.onrender.com/api/payments/payment-callback"
        };

        // 3️⃣ Generate sign
        const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

        // 4️⃣ Call Edviron API
        const response = await axios.post(
            "https://dev-vanilla.edviron.com/erp/create-collect-request",
            { ...payload, sign },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        console.log("Edviron response:", response.data);

        // 5️⃣ Update order with gateway ID
        order.gateway_order_id = response.data.collect_request_id;
        await order.save();

        console.log("Updated order with gateway ID:", order.gateway_order_id);

        // 6️⃣ Save initial order status
        await OrderStatus.create({
            collect_id: order._id,
            gateway_order_id: response.data.collect_request_id,
            school_id: effectiveSchoolId,
            order_amount: amount,
            status: "PENDING"
        });

        console.log("Created order status for order:", order._id);

        return res.status(200).json({
            message: "Payment initiated",
            collect_request_id: response.data.collect_request_id || null,
            redirect_url: response.data.collect_request_url || response.data.payment_url || null
        });
    } catch (err) {
        console.error("Edviron error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Payment error",
            error: err.response?.data || err.message
        });
    }
};


// ---------------------------
// 2. Check Payment Status
// ---------------------------
export const checkPaymentStatus = async (req, res) => {
    try {
        const { collect_request_id } = req.params;

        console.log("Checking status for collect_request_id:", collect_request_id);

        // First, find the order by the gateway_order_id
        const order = await Order.findOne({
            gateway_order_id: collect_request_id
        });

        if (!order) {
            console.error("Order not found for gateway ID:", collect_request_id);
            return res.status(404).json({ message: "Order not found" });
        }

        // Generate JWT sign
        const sign = jwt.sign(
            { school_id: order.school_id, collect_request_id },
            process.env.PG_KEY,
            { algorithm: "HS256" }
        );

        // Call Edviron API to get payment status
        const response = await axios.get(
            `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${order.school_id}&sign=${sign}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        const data = response.data;
        console.log("Full Edviron status response:", JSON.stringify(data, null, 2));

        // Extract payment details from the response
        const paymentDetails = data.details || {};

        // Update OrderStatus in DB based on real-time status
        const update = {
            status: data.status || "PENDING",
            transaction_amount: data.amount || null,
            payment_time: data.payment_time ? new Date(data.payment_time) :
                (data.status === 'SUCCESS' ? new Date() : null),
            payment_mode: paymentDetails.payment_mode || null,
            payment_details: paymentDetails ? JSON.stringify(paymentDetails) : null,
            bank_reference: paymentDetails.bank_ref || null,
            payment_message: data.message || null,
            error_message: data.error_message || null
        };

        // Update using the internal order ID (collect_id)
        await OrderStatus.findOneAndUpdate(
            { collect_id: order._id },
            update,
            { upsert: true, new: true }
        );

        return res.json(data);
    } catch (err) {
        console.error("Status check error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Status check failed",
            error: err.response?.data || err.message
        });
    }
};

// ---------------------------
// 3. Handle Webhook
// ---------------------------
export const handleWebhook = async (req, res) => {
    try {
        const { order_info } = req.body;

        console.log("Webhook received:", req.body);

        if (!order_info || !order_info.order_id) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        // Log webhook payload for debugging/audit
        await WebhookLog.create({ payload: req.body });

        // First, find the order by the gateway_order_id
        const order = await Order.findOne({
            gateway_order_id: order_info.order_id
        });

        console.log("Found order for webhook:", order);

        if (!order) {
            console.error("Order not found for gateway ID:", order_info.order_id);
            return res.status(404).json({ message: "Order not found" });
        }

        // Prepare data to update OrderStatus
        const updateData = {
            order_amount: order_info.order_amount,
            transaction_amount: order_info.transaction_amount,
            payment_mode: order_info.payment_mode || order_info.details?.payment_mode,
            payment_details: order_info.payment_details ||
                (order_info.details ? JSON.stringify(order_info.details) : null),
            bank_reference: order_info.bank_reference || order_info.details?.bank_ref,
            payment_message: order_info.Payment_message || order_info.message,
            status: order_info.status.toUpperCase(),
            error_message: order_info.error_message,
            payment_time: order_info.payment_time ? new Date(order_info.payment_time) :
                (order_info.status.toUpperCase() === 'SUCCESS' ? new Date() : null)
        };

        // Update OrderStatus using your internal order ID
        const updatedOrder = await OrderStatus.findOneAndUpdate(
            { collect_id: order._id }, // Use your internal order ID
            updateData,
            { upsert: true, new: true }
        );

        console.log("Full Edviron response:", JSON.stringify(data, null, 2));
        console.log("Webhook processed:", updatedOrder);

        return res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ message: "Webhook error", error: err.message });
    }
};

// ---------------------------
// 4. Handle Payment Callback
// ---------------------------
export const handlePaymentCallback = async (req, res) => {
    try {
        const { EdvironCollectRequestId, status } = req.query;

        console.log("Payment callback received:", { EdvironCollectRequestId, status });

        if (!EdvironCollectRequestId) {
            return res.status(400).json({ message: "Missing collect request ID" });
        }

        // Find the order by the gateway_order_id
        const order = await Order.findOne({
            gateway_order_id: EdvironCollectRequestId
        });

        if (!order) {
            console.error("Order not found for gateway ID:", EdvironCollectRequestId);
            return res.status(404).json({ message: "Order not found" });
        }

        // If status is SUCCESS, update the order status
        if (status === "SUCCESS") {
            // Generate JWT sign using the school_id from the order
            const sign = jwt.sign(
                { school_id: order.school_id, collect_request_id: EdvironCollectRequestId },
                process.env.PG_KEY,
                { algorithm: "HS256" }
            );

            // Call Edviron API to get payment status
            const response = await axios.get(
                `https://dev-vanilla.edviron.com/erp/collect-request/${EdvironCollectRequestId}?school_id=${order.school_id}&sign=${sign}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`
                    }
                }
            );

            const data = response.data;
            console.log("Full Edviron status response from callback:", JSON.stringify(data, null, 2));

            // Extract payment details from the response
            const paymentDetails = data.details || {};

            // Update OrderStatus in DB based on real-time status
            const update = {
                status: data.status || "PENDING",
                transaction_amount: data.amount || null,
                payment_time: data.payment_time ? new Date(data.payment_time) :
                    (data.status === 'SUCCESS' ? new Date() : null),
                payment_mode: paymentDetails.payment_mode || null,
                payment_details: paymentDetails ? JSON.stringify(paymentDetails) : null,
                bank_reference: paymentDetails.bank_ref || null,
                payment_message: data.message || null,
                error_message: data.error_message || null
            };

            // Update using the internal order ID (collect_id)
            await OrderStatus.findOneAndUpdate(
                { collect_id: order._id },
                update,
                { upsert: true, new: true }
            );

            console.log("Order status updated from callback");
        }

        // Redirect to the transactions page with success message
        return res.redirect(`https://task-1-u5ou.onrender.com/transactions?status=${status}&collectRequestId=${EdvironCollectRequestId}`);
    } catch (err) {
        console.error("Callback error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Callback processing failed",
            error: err.response?.data || err.message
        });
    }
};