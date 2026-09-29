package com.example.data

import kotlinx.coroutines.flow.Flow

class AppRepository(
    private val produceDao: ProduceDao,
    private val transactionDao: TransactionDao,
    private val messageDao: MessageDao
) {
    val allProduce: Flow<List<ProduceEntity>> = produceDao.getAllProduce()
    val allTransactions: Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()
    val allMessages: Flow<List<MessageEntity>> = messageDao.getAllMessages()

    suspend fun insertProduce(produce: ProduceEntity) {
        produceDao.insertProduce(produce)
    }

    suspend fun updateProduce(produce: ProduceEntity) {
        produceDao.updateProduce(produce)
    }

    suspend fun deleteProduce(id: Int) {
        produceDao.deleteProduceById(id)
    }

    suspend fun insertTransaction(transaction: TransactionEntity) {
        transactionDao.insertTransaction(transaction)
    }

    suspend fun updateTransactionStatus(id: Int, status: String) {
        transactionDao.updateStatus(id, status)
    }

    suspend fun insertMessage(message: MessageEntity) {
        messageDao.insertMessage(message)
    }

    suspend fun seedDatabase() {
        if (produceDao.getCount() == 0) {
            val crops = listOf(
                ProduceEntity(
                    id = 1,
                    name = "Organic Roma Tomatoes",
                    price = 2.40,
                    unit = "kg",
                    quantity = "120 kg",
                    farmerName = "Mateo Gutierrez",
                    farmerPhone = "+1 (555) 234-7890",
                    location = "Green Valley, Block 4",
                    category = "Vegetables",
                    harvestDate = "Harvested today",
                    middlemanPrice = 4.20,
                    description = "Naturally sun-ripened Roma tomatoes grown using bio-compost and zero synthetic pesticides. Firm, vibrant red skin with rich sweetness, perfect for sauces, fresh salads, and canning.",
                    isOrganic = true
                ),
                ProduceEntity(
                    id = 2,
                    name = "Golden Sweet Corn",
                    price = 1.10,
                    unit = "ear",
                    quantity = "350 ears",
                    farmerName = "Elena Vasquez",
                    farmerPhone = "+1 (555) 890-1234",
                    location = "Sunny Meadows Farm",
                    category = "Vegetables",
                    harvestDate = "Harvested yesterday",
                    middlemanPrice = 2.10,
                    description = "Crisp, milky sweet corn freshly picked at early dawn to seal in natural sugars. Plump, bright yellow kernels that burst with sweetness when boiled or grilled.",
                    isOrganic = false
                ),
                ProduceEntity(
                    id = 3,
                    name = "Crisp Fuji Apples",
                    price = 2.80,
                    unit = "kg",
                    quantity = "85 kg",
                    farmerName = "Kwame Mensah",
                    farmerPhone = "+1 (555) 345-6789",
                    location = "Highland Orchards",
                    category = "Fruits",
                    harvestDate = "2 days ago",
                    middlemanPrice = 4.60,
                    description = "Hand-picked Fuji apples from elevation groves. Extra crunchy with balanced tartness and honeyed sweetness. Naturally waxed on the branch with clean river water irrigation.",
                    isOrganic = true
                ),
                ProduceEntity(
                    id = 4,
                    name = "Yukon Gold Potatoes",
                    price = 0.95,
                    unit = "kg",
                    quantity = "200 kg",
                    farmerName = "Siddharth Patel",
                    farmerPhone = "+1 (555) 456-7890",
                    location = "Riverbed Basin Fields",
                    category = "Tubers",
                    harvestDate = "3 days ago",
                    middlemanPrice = 1.90,
                    description = "Creamy, naturally buttery Yukon Gold potatoes cured for prolonged shelf life. Ideal for roasting, mashing, or hearty stews without peeling.",
                    isOrganic = true
                ),
                ProduceEntity(
                    id = 5,
                    name = "Pure Forest Raw Honey",
                    price = 8.50,
                    unit = "jar (500g)",
                    quantity = "40 jars",
                    farmerName = "Lucia Morales",
                    farmerPhone = "+1 (555) 567-8901",
                    location = "Cedar Ridge Apiary",
                    category = "Honey & Dairy",
                    harvestDate = "1 week ago",
                    middlemanPrice = 14.00,
                    description = "Raw, unpasteurized wildflower honey extracted by sustainable beekeepers. Contains natural pollen, enzymes, and a soothing amber floral aroma.",
                    isOrganic = true
                ),
                ProduceEntity(
                    id = 6,
                    name = "Green Bell Peppers",
                    price = 1.75,
                    unit = "kg",
                    quantity = "90 kg",
                    farmerName = "Mateo Gutierrez",
                    farmerPhone = "+1 (555) 234-7890",
                    location = "Green Valley, Block 4",
                    category = "Vegetables",
                    harvestDate = "Harvested today",
                    middlemanPrice = 3.20,
                    description = "Thick-walled, crunchy green bell peppers with a fresh grassy kick. Picked fresh this morning, ideal for fajitas, stuffing, or crisp snacking.",
                    isOrganic = true
                )
            )

            for (crop in crops) {
                produceDao.insertProduce(crop)
            }
        }

        // Seed initial transaction if empty
        if (transactionDao.getCount() == 0) {
            transactionDao.insertTransaction(
                TransactionEntity(
                    id = 1,
                    produceId = 1,
                    produceName = "Organic Roma Tomatoes",
                    amount = 24.00,
                    quantityOrdered = "10 kg",
                    buyerName = "Elena Green Grocers",
                    farmerName = "Mateo Gutierrez",
                    farmerPhone = "+1 (555) 234-7890",
                    deliveryMethod = "Direct Farm Delivery",
                    deliveryAddress = "Market St Hub #4B",
                    paymentMethod = "AgriPay Escrow",
                    status = "In Transit",
                    trackingCode = "AGRI-9281-GR",
                    timestamp = System.currentTimeMillis() - (3600 * 1000 * 5)
                )
            )
        }

        // Seed sample introductory chat message if empty
        if (messageDao.getCount() == 0) {
            messageDao.insertMessage(
                MessageEntity(
                    farmerName = "Mateo Gutierrez",
                    produceName = "Organic Roma Tomatoes",
                    sender = "Farmer",
                    content = "Hello! Thanks for your interest in our Roma Tomatoes. They were harvested fresh this morning from Block 4. Let me know if you need specific crate packaging!",
                    timestamp = System.currentTimeMillis() - (3600 * 1000 * 2)
                )
            )
        }
    }
}
