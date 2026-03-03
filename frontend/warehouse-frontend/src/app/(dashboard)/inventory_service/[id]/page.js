"use client";

import { useCallback, useEffect, useState } from "react";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import HistoryIcon from "@mui/icons-material/History";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";
import { useParams } from "next/navigation";

import PageHeader from "@/components/workforce/PageHeader";
import DataTable from "@/components/workforce/DataTable";
import {
	EmptyState,
	LoadingState,
	Toast,
} from "@/components/workforce/shared";
import { getAdjustmentHistory, getInventoryById } from "@/services/inventory";

const statusStyles = {
	AVAILABLE: { bgcolor: "#dcfce7", color: "#166534" },
	RESERVED: { bgcolor: "#dbeafe", color: "#1e40af" },
	DAMAGED: { bgcolor: "#fee2e2", color: "#991b1b" },
	OUT_OF_STOCK: { bgcolor: "#f1f5f9", color: "#334155" },
};

export default function InventoryDetailsPage() {
	const params = useParams();
	const inventoryId = params?.id;

	const [inventory, setInventory] = useState(null);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [toast, setToast] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [inventoryRes, historyRes] = await Promise.all([
				getInventoryById(inventoryId),
				getAdjustmentHistory(inventoryId),
			]);
			setInventory(inventoryRes.data);
			setHistory(historyRes.data);
		} catch {
			setToast({
				open: true,
				message: "Failed to load inventory details",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [inventoryId]);

	useEffect(() => {
		if (inventoryId) fetchData();
	}, [inventoryId, fetchData]);

	if (loading) return <LoadingState message="Loading inventory details..." />;

	if (!inventory) {
		return <EmptyState icon={<Inventory2Icon />} message="Inventory not found." />;
	}

	const detailCards = [
		{ label: "Batch", value: inventory.batchNo || "—" },
		{ label: "Product", value: inventory.productName || "—" },
		{
			label: "Location",
			value: `${inventory.zone || "—"} / ${inventory.rackNo || "—"} / ${inventory.binNo || "—"}`,
		},
		{ label: "Available", value: inventory.quantityAvailable ?? "—" },
		{ label: "Reserved", value: inventory.quantityReserved ?? "—" },
		{ label: "Damaged", value: inventory.quantityDamaged ?? "—" },
		{ label: "Total Available", value: inventory.totalAvailable ?? "—" },
		{
			label: "Low-stock Threshold",
			value: inventory.lowStockThreshold ?? "—",
		},
		{
			label: "Expiry Date",
			value: inventory.expiryDate || "—",
		},
		{
			label: "Last Updated",
			value: inventory.lastUpdated
				? new Date(inventory.lastUpdated).toLocaleString()
				: "—",
		},
	];

	const historyColumns = [
		{ id: "adjustmentId", label: "ID", sortable: true },
		{
			id: "adjustmentType",
			label: "Type",
			sortable: true,
			render: (row) => (
				<Chip
					label={row.adjustmentType?.replace(/_/g, " ")}
					size="small"
					sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600 }}
				/>
			),
		},
		{ id: "quantityChange", label: "Qty Change", sortable: true },
		{ id: "reason", label: "Reason", sortable: false },
		{ id: "adjustedBy", label: "Adjusted By", sortable: true },
		{
			id: "createdAt",
			label: "Created At",
			sortable: true,
			render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
		},
	];

	const statusStyle = statusStyles[inventory.stockStatus] || {
		bgcolor: "#f1f5f9",
		color: "#334155",
	};

	return (
		<Box>
			<PageHeader
				title={`Inventory #${inventory.inventoryId}`}
				subtitle="Batch details and full adjustment history."
				icon={<Inventory2Icon sx={{ fontSize: 32 }} />}
				backHref="/inventory_service/inventories"
			/>

			<Paper
				elevation={0}
				sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}
			>
				<Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
					<Chip
						label={inventory.stockStatus?.replace(/_/g, " ") || "UNKNOWN"}
						size="small"
						sx={{ fontWeight: 600, ...statusStyle }}
					/>
					<Chip
						label={inventory.isLowStock ? "Low Stock" : "Stock OK"}
						size="small"
						sx={{
							fontWeight: 600,
							bgcolor: inventory.isLowStock ? "#fee2e2" : "#dcfce7",
							color: inventory.isLowStock ? "#991b1b" : "#166534",
						}}
					/>
				</Box>

				<Grid container spacing={2}>
					{detailCards.map((card) => (
						<Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
							<Box
								sx={{
									border: "1px solid",
									borderColor: "#e2e8f0",
									borderRadius: 2,
									p: 1.5,
								}}
							>
								<Typography variant="caption" sx={{ color: "#94a3b8" }}>
									{card.label}
								</Typography>
								<Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 600 }}>
									{card.value}
								</Typography>
							</Box>
						</Grid>
					))}
				</Grid>
			</Paper>

			<PageHeader
				title="Adjustment History"
				icon={<HistoryIcon sx={{ fontSize: 28 }} />}
				count={history.length}
			/>

			<DataTable
				columns={historyColumns}
				rows={history}
				searchKeys={["adjustmentType", "reason", "adjustedBy"]}
				emptyComponent={
					<EmptyState icon={<HistoryIcon />} message="No adjustment history found." />
				}
			/>

			<Toast
				open={toast.open}
				message={toast.message}
				severity={toast.severity}
				onClose={() => setToast((current) => ({ ...current, open: false }))}
			/>
		</Box>
	);
}
