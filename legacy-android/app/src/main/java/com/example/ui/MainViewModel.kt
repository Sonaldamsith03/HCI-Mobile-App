package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.AppRepository
import com.example.data.MessageEntity
import com.example.data.ProduceEntity
import com.example.data.TransactionEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class UserRole {
    FARMER, BUYER, ADMIN
}

class MainViewModel(private val repository: AppRepository) : ViewModel() {
    val allProduce: StateFlow<List<ProduceEntity>> = repository.allProduce.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val allTransactions: StateFlow<List<TransactionEntity>> = repository.allTransactions.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val allMessages: StateFlow<List<MessageEntity>> = repository.allMessages.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    init {
        viewModelScope.launch {
            repository.seedDatabase()
        }
    }

    fun addProduce(
        name: String,
        price: Double,
        quantity: String,
        category: String,
        unit: String = "kg",
        farmerName: String = "Mateo Gutierrez",
        farmerPhone: String = "+1 (555) 234-7890",
        location: String = "Green Valley, Block 4",
        harvestDate: String = "Harvested today",
        description: String = "",
        isOrganic: Boolean = true
    ) {
        viewModelScope.launch {
            val middlemanPrice = price * 1.55
            val desc = if (description.isNotBlank()) description
            else "Freshly harvested $name cultivated with sustainable methods, high nutritional density, and zero harmful chemicals directly from our local farm."
            repository.insertProduce(
                ProduceEntity(
                    name = name,
                    price = price,
                    unit = unit,
                    quantity = quantity,
                    farmerName = farmerName,
                    farmerPhone = farmerPhone,
                    location = location,
                    category = category,
                    harvestDate = harvestDate,
                    middlemanPrice = middlemanPrice,
                    description = desc,
                    isOrganic = isOrganic
                )
            )
        }
    }

    fun updateProduce(produce: ProduceEntity) {
        viewModelScope.launch {
            repository.updateProduce(produce)
        }
    }

    fun deleteProduce(produceId: Int) {
        viewModelScope.launch {
            repository.deleteProduce(produceId)
        }
    }

    fun updateOrderStatus(transactionId: Int, newStatus: String) {
        viewModelScope.launch {
            repository.updateTransactionStatus(transactionId, newStatus)
        }
    }

    fun purchaseProduce(
        produce: ProduceEntity,
        quantityValue: Int,
        deliveryMethod: String,
        deliveryAddress: String,
        paymentMethod: String,
        totalCost: Double
    ) {
        viewModelScope.launch {
            val trackingCode = "AGRI-${Random.nextInt(1000, 9999)}-${produce.category.take(2).uppercase()}"
            val tx = TransactionEntity(
                produceId = produce.id,
                produceName = produce.name,
                amount = totalCost,
                quantityOrdered = "$quantityValue ${produce.unit}",
                buyerName = "Elena Green Grocers",
                farmerName = produce.farmerName,
                farmerPhone = produce.farmerPhone,
                deliveryMethod = deliveryMethod,
                deliveryAddress = deliveryAddress.ifBlank { "Primary Pickup Hub" },
                paymentMethod = paymentMethod,
                status = "Confirmed",
                trackingCode = trackingCode,
                timestamp = System.currentTimeMillis()
            )
            repository.insertTransaction(tx)

            // Auto-generate notification/confirmation message in direct chat
            repository.insertMessage(
                MessageEntity(
                    farmerName = produce.farmerName,
                    produceName = produce.name,
                    sender = "Buyer",
                    content = "Hello ${produce.farmerName}, I just booked $quantityValue ${produce.unit} of ${produce.name} for $${String.format("%.2f", totalCost)} ($deliveryMethod). Tracking ID: $trackingCode.",
                    timestamp = System.currentTimeMillis()
                )
            )
        }
    }

    fun bookProduce(
        produce: ProduceEntity,
        quantity: Int,
        deliveryMethod: String,
        deliveryAddress: String,
        paymentMethod: String
    ) {
        val deliveryFee = when (deliveryMethod) {
            "Direct Farm Delivery" -> 3.00
            "Regional Agri-Hub" -> 1.50
            else -> 0.00
        }
        val totalCost = (quantity * produce.price) + deliveryFee
        purchaseProduce(produce, quantity, deliveryMethod, deliveryAddress, paymentMethod, totalCost)
    }

    fun sendMessage(farmerName: String, produceName: String, content: String, sender: String = "Buyer") {
        if (content.isBlank()) return
        viewModelScope.launch {
            repository.insertMessage(
                MessageEntity(
                    farmerName = farmerName,
                    produceName = produceName,
                    sender = sender,
                    content = content,
                    timestamp = System.currentTimeMillis()
                )
            )
        }
    }
}

class MainViewModelFactory(private val repository: AppRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
