package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "produce_table")
data class ProduceEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val price: Double,
    val unit: String = "kg",
    val quantity: String,
    val farmerName: String,
    val farmerPhone: String = "+1 (555) 234-5678",
    val location: String,
    val imageUrl: String = "",
    val category: String = "Vegetables", // Vegetables, Fruits, Grains, Tubers, Honey & Dairy
    val harvestDate: String = "2 days ago",
    val middlemanPrice: Double = 0.0,
    val description: String = "",
    val isOrganic: Boolean = true
)
