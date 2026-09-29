package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transaction_table")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val produceId: Int,
    val produceName: String,
    val amount: Double,
    val quantityOrdered: String = "1 kg",
    val buyerName: String,
    val farmerName: String,
    val farmerPhone: String = "+1 (555) 234-5678",
    val deliveryMethod: String = "Direct Farm Delivery",
    val deliveryAddress: String = "Buyer Central Hub",
    val paymentMethod: String = "AgriPay Escrow",
    val status: String = "Confirmed", // Confirmed, Packed at Farm, In Transit, Delivered
    val trackingCode: String = "AGRI-8429",
    val timestamp: Long = System.currentTimeMillis()
)
