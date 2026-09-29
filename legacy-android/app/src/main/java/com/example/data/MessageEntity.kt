package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "message_table")
data class MessageEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val farmerName: String,
    val produceName: String,
    val sender: String, // "Buyer" or "Farmer"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)
