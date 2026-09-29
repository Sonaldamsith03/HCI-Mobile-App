package com.example.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.example.data.MessageEntity
import com.example.data.ProduceEntity
import com.example.data.TransactionEntity
import com.example.ui.components.*
import com.example.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FarmerDashboard(navController: NavController, viewModel: MainViewModel) {
    val produceList by viewModel.allProduce.collectAsStateWithLifecycle()
    val transactions by viewModel.allTransactions.collectAsStateWithLifecycle()
    val messages by viewModel.allMessages.collectAsStateWithLifecycle()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var showAddCropDialog by remember { mutableStateOf(false) }
    var editingProduce by remember { mutableStateOf<ProduceEntity?>(null) }
    var deletingProduce by remember { mutableStateOf<ProduceEntity?>(null) }
    var statusUpdatingTx by remember { mutableStateOf<TransactionEntity?>(null) }

    Scaffold(
        containerColor = CanvasBackgroundLight,
        topBar = {
            Surface(
                color = CanvasSurfaceLight,
                shadowElevation = 2.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.bounceClick()
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = ForestGreenPrimary
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Farmer Hub",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp,
                            color = EarthTextPrimary
                        )
                        Text(
                            text = "Direct Sales & Farm Management",
                            fontSize = 12.sp,
                            color = EarthTextSecondary
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MintContainer
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                        ) {
                            Icon(
                                Icons.Default.Verified,
                                contentDescription = null,
                                tint = ForestGreenPrimary,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Verified Farm",
                                fontSize = 11.sp,
                                color = MintText,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = CanvasSurfaceLight,
                tonalElevation = 6.dp,
                modifier = Modifier.navigationBarsPadding()
            ) {
                NavigationBarItem(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (produceList.isNotEmpty()) {
                                    Badge(
                                        containerColor = ForestGreenPrimary,
                                        contentColor = Color.White
                                    ) { Text("${produceList.size}") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.Agriculture, contentDescription = "My Crops")
                        }
                    },
                    label = { Text("My Crops", fontWeight = if (selectedTabIndex == 0) FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ForestGreenPrimary,
                        selectedTextColor = ForestGreenPrimary,
                        indicatorColor = MintContainer,
                        unselectedIconColor = EarthTextSecondary,
                        unselectedTextColor = EarthTextSecondary
                    )
                )
                NavigationBarItem(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (transactions.isNotEmpty()) {
                                    Badge(
                                        containerColor = HarvestGold,
                                        contentColor = Color.White
                                    ) { Text("${transactions.size}") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.ReceiptLong, contentDescription = "Orders")
                        }
                    },
                    label = { Text("Buyer Orders", fontWeight = if (selectedTabIndex == 1) FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ForestGreenPrimary,
                        selectedTextColor = ForestGreenPrimary,
                        indicatorColor = MintContainer,
                        unselectedIconColor = EarthTextSecondary,
                        unselectedTextColor = EarthTextSecondary
                    )
                )
                NavigationBarItem(
                    selected = selectedTabIndex == 2,
                    onClick = { selectedTabIndex = 2 },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (messages.isNotEmpty()) {
                                    Badge(
                                        containerColor = ForestGreenPrimary,
                                        contentColor = Color.White
                                    ) { Text("${messages.size}") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.ChatBubbleOutline, contentDescription = "Buyer Messages")
                        }
                    },
                    label = { Text("Buyer Chat", fontWeight = if (selectedTabIndex == 2) FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ForestGreenPrimary,
                        selectedTextColor = ForestGreenPrimary,
                        indicatorColor = MintContainer,
                        unselectedIconColor = EarthTextSecondary,
                        unselectedTextColor = EarthTextSecondary
                    )
                )
            }
        },
        floatingActionButton = {
            if (selectedTabIndex == 0) {
                ExtendedFloatingActionButton(
                    onClick = { showAddCropDialog = true },
                    modifier = Modifier.bounceClick(),
                    containerColor = HarvestGold,
                    contentColor = Color.White,
                    icon = { Icon(Icons.Default.Add, contentDescription = null) },
                    text = { Text("Post New Crop", fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(CanvasBackgroundLight)
        ) {
            AnimatedContent(
                targetState = selectedTabIndex,
                transitionSpec = {
                    if (targetState > initialState) {
                        slideInHorizontally(tween(250)) { it } + fadeIn(tween(250)) togetherWith
                                slideOutHorizontally(tween(200)) { -it } + fadeOut(tween(200))
                    } else {
                        slideInHorizontally(tween(250)) { -it } + fadeIn(tween(250)) togetherWith
                                slideOutHorizontally(tween(200)) { it } + fadeOut(tween(200))
                    }
                },
                label = "farmer_tabs_animation"
            ) { targetTab ->
                when (targetTab) {
                    0 -> FarmerCropsTab(
                        produceList = produceList,
                        onEditCrop = { editingProduce = it },
                        onDeleteCrop = { deletingProduce = it }
                    )
                    1 -> FarmerOrdersTab(
                        orders = transactions,
                        onUpdateStatus = { tx -> statusUpdatingTx = tx }
                    )
                    2 -> FarmerChatTab(
                        messages = messages,
                        produceList = produceList,
                        onSendReply = { farmer, crop, msg ->
                            viewModel.sendMessage(farmer, crop, msg, sender = "Farmer")
                        }
                    )
                }
            }
        }
    }

    // Modal: Add New Crop
    if (showAddCropDialog) {
        CropFormDialog(
            title = "Post Fresh Harvest Crop",
            produce = null,
            onDismiss = { showAddCropDialog = false },
            onSave = { name, price, qty, cat, unit, harvest, phone, loc, desc, isOrg ->
                viewModel.addProduce(
                    name = name,
                    price = price,
                    quantity = qty,
                    category = cat,
                    unit = unit,
                    farmerPhone = phone,
                    location = loc,
                    harvestDate = harvest,
                    description = desc,
                    isOrganic = isOrg
                )
                showAddCropDialog = false
            }
        )
    }

    // Modal: Edit Existing Crop
    if (editingProduce != null) {
        CropFormDialog(
            title = "Edit Crop Listing",
            produce = editingProduce,
            onDismiss = { editingProduce = null },
            onSave = { name, price, qty, cat, unit, harvest, phone, loc, desc, isOrg ->
                viewModel.updateProduce(
                    editingProduce!!.copy(
                        name = name,
                        price = price,
                        quantity = qty,
                        category = cat,
                        unit = unit,
                        harvestDate = harvest,
                        farmerPhone = phone,
                        location = loc,
                        description = desc,
                        isOrganic = isOrg
                    )
                )
                editingProduce = null
            }
        )
    }

    // Modal: Confirm Delete Crop
    if (deletingProduce != null) {
        AlertDialog(
            onDismissRequest = { deletingProduce = null },
            title = {
                Text("Delete Listing?", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    "Are you sure you want to remove '${deletingProduce!!.name}' from the marketplace? Buyers won't be able to order it.",
                    color = EarthTextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteProduce(deletingProduce!!.id)
                        deletingProduce = null
                    },
                    modifier = Modifier.bounceClick(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { deletingProduce = null },
                    modifier = Modifier.bounceClick()
                ) {
                    Text("Cancel", color = EarthTextSecondary)
                }
            }
        )
    }

    // Modal: Update Order Fulfillment Status
    if (statusUpdatingTx != null) {
        UpdateOrderStatusDialog(
            transaction = statusUpdatingTx!!,
            onDismiss = { statusUpdatingTx = null },
            onStatusSelected = { newStatus ->
                viewModel.updateOrderStatus(statusUpdatingTx!!.id, newStatus)
                statusUpdatingTx = null
            }
        )
    }
}

// -----------------------------------------------------------------------------
// TAB 1: FARMER CROPS & INVENTORY MANAGEMENT
// -----------------------------------------------------------------------------

@Composable
fun FarmerCropsTab(
    produceList: List<ProduceEntity>,
    onEditCrop: (ProduceEntity) -> Unit,
    onDeleteCrop: (ProduceEntity) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            // Farm Overview Stats Banner (60% background, 30% deep green container, 10% amber highlights)
            Card(
                colors = CardDefaults.cardColors(containerColor = MintContainer),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight.copy(alpha = 0.25f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Mateo's Eco-Farm",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp,
                                color = MintText
                            )
                            Text(
                                text = "Green Valley, Block 4 • Direct Seller",
                                fontSize = 12.sp,
                                color = ForestGreenMedium
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(CanvasSurfaceLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Agriculture,
                                contentDescription = null,
                                tint = ForestGreenPrimary,
                                modifier = Modifier.size(26.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = ForestGreenLight.copy(alpha = 0.2f))
                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "${produceList.size}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 22.sp,
                                color = ForestGreenPrimary
                            )
                            Text(
                                text = "Active Listings",
                                fontSize = 11.sp,
                                color = EarthTextSecondary
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "100%",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 22.sp,
                                color = HarvestGoldDark
                            )
                            Text(
                                text = "Direct Margin",
                                fontSize = 11.sp,
                                color = EarthTextSecondary
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Verified",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 22.sp,
                                color = ForestGreenPrimary
                            )
                            Text(
                                text = "Producer Tier",
                                fontSize = 11.sp,
                                color = EarthTextSecondary
                            )
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Your Crops on Marketplace (${produceList.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = EarthTextPrimary
                )
            }
        }

        if (produceList.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(MintContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.AddBusiness,
                                contentDescription = null,
                                modifier = Modifier.size(36.dp),
                                tint = ForestGreenPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "No crops posted yet",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = EarthTextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Tap '+ Post New Crop' to list your harvest for direct buyer orders.",
                            style = MaterialTheme.typography.bodySmall,
                            color = EarthTextSecondary,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 24.dp)
                        )
                    }
                }
            }
        } else {
            items(produceList, key = { it.id }) { produce ->
                FarmerProduceCard(
                    produce = produce,
                    onEdit = { onEditCrop(produce) },
                    onDelete = { onDeleteCrop(produce) }
                )
            }
        }
    }
}

@Composable
fun FarmerProduceCard(
    produce: ProduceEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    AgriCard {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    CategoryTag(produce.category)
                    if (produce.isOrganic) {
                        OrganicBadge()
                    }
                }

                // Price display
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format("%.2f", produce.price)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = ForestGreenPrimary
                    )
                    Text(
                        text = "per ${produce.unit}",
                        fontSize = 11.sp,
                        color = EarthTextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = produce.name,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                color = EarthTextPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Inventory2,
                    contentDescription = null,
                    tint = ForestGreenPrimary,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${produce.quantity} in inventory • Harvest: ${produce.harvestDate}",
                    fontSize = 12.sp,
                    color = EarthTextSecondary
                )
            }

            // Description summary
            if (produce.description.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = produce.description,
                    fontSize = 12.sp,
                    color = EarthTextSecondary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = CanvasBorderLight)
            Spacer(modifier = Modifier.height(10.dp))

            // Action Row: Edit & Delete
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = onDelete,
                    modifier = Modifier.bounceClick(),
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.width(8.dp))

                Button(
                    onClick = onEdit,
                    modifier = Modifier.bounceClick(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Edit Details", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// TAB 2: FARMER ORDERS & SHIPMENT FULFILLMENT
// -----------------------------------------------------------------------------

@Composable
fun FarmerOrdersTab(
    orders: List<TransactionEntity>,
    onUpdateStatus: (TransactionEntity) -> Unit
) {
    val totalEarnings = orders.sumOf { it.amount }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            // Financial Summary Banner
            Card(
                colors = CardDefaults.cardColors(containerColor = MintContainer),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight.copy(alpha = 0.25f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Direct Farm Earnings",
                                fontSize = 12.sp,
                                color = MintText,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "$${String.format("%.2f", totalEarnings)}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 28.sp,
                                color = ForestGreenPrimary
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(CanvasSurfaceLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Payments,
                                contentDescription = null,
                                tint = HarvestGoldDark,
                                modifier = Modifier.size(26.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "100% of purchase proceeds go directly to your registered farm account with zero marketplace deductions.",
                        fontSize = 11.sp,
                        color = ForestGreenMedium
                    )
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Buyer Orders to Fulfill (${orders.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = EarthTextPrimary
                )
            }
        }

        if (orders.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No buyer orders placed yet.\nOrders from buyers will appear here in real time.",
                        textAlign = TextAlign.Center,
                        color = EarthTextMuted,
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            items(orders, key = { it.id }) { tx ->
                FarmerOrderCard(
                    order = tx,
                    onUpdateStatus = { onUpdateStatus(tx) }
                )
            }
        }
    }
}

@Composable
fun FarmerOrderCard(
    order: TransactionEntity,
    onUpdateStatus: () -> Unit
) {
    AgriCard {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Tracking & Status Pill
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.trackingCode,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = ForestGreenPrimary
                )

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = when (order.status) {
                        "Delivered" -> MintContainer
                        "In Transit" -> HarvestGoldContainer
                        else -> CanvasSurfaceVariant
                    }
                ) {
                    Text(
                        text = order.status,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (order.status) {
                            "Delivered" -> ForestGreenPrimary
                            "In Transit" -> HarvestGoldText
                            else -> EarthTextPrimary
                        },
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Order Content Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.produceName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = EarthTextPrimary
                    )
                    Text(
                        text = "Ordered by: ${order.buyerName}",
                        fontSize = 13.sp,
                        color = EarthTextSecondary
                    )
                    Text(
                        text = "Quantity: ${order.quantityOrdered}",
                        fontSize = 13.sp,
                        color = EarthTextSecondary
                    )
                    Text(
                        text = "Fulfillment: ${order.deliveryMethod}",
                        fontSize = 12.sp,
                        color = EarthTextMuted
                    )
                    Text(
                        text = "Address: ${order.deliveryAddress}",
                        fontSize = 12.sp,
                        color = EarthTextMuted
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format("%.2f", order.amount)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 19.sp,
                        color = ForestGreenPrimary
                    )
                    Text(
                        text = order.paymentMethod,
                        fontSize = 10.sp,
                        color = EarthTextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = CanvasBorderLight)
            Spacer(modifier = Modifier.height(10.dp))

            // Status Update Trigger Action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Update shipment state:",
                    fontSize = 12.sp,
                    color = EarthTextSecondary
                )

                HarvestAccentButton(
                    text = "Update Status",
                    icon = Icons.Default.EditRoad,
                    onClick = onUpdateStatus
                )
            }
        }
    }
}

// -----------------------------------------------------------------------------
// TAB 3: FARMER CHAT & INQUIRY REPLIES
// -----------------------------------------------------------------------------

@Composable
fun FarmerChatTab(
    messages: List<MessageEntity>,
    produceList: List<ProduceEntity>,
    onSendReply: (farmer: String, crop: String, message: String) -> Unit
) {
    var replyText by remember { mutableStateOf("") }
    val defaultFarmerName = produceList.firstOrNull()?.farmerName ?: "Mateo Gutierrez"

    Column(modifier = Modifier.fillMaxSize()) {
        Surface(
            color = CanvasSurfaceLight,
            shadowElevation = 1.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.ChatBubbleOutline,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Buyer Inquiry In-Box",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = EarthTextPrimary
                    )
                    Text(
                        text = "${messages.size} direct inquiries received",
                        fontSize = 11.sp,
                        color = EarthTextSecondary
                    )
                }
            }
        }

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (messages.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No buyer messages yet.\nInquiries about batch orders and farm pickups will appear here.",
                            textAlign = TextAlign.Center,
                            fontSize = 13.sp,
                            color = EarthTextMuted
                        )
                    }
                }
            } else {
                items(messages, key = { it.id }) { msg ->
                    val isFarmer = msg.sender.equals("Farmer", ignoreCase = true)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isFarmer) Arrangement.End else Arrangement.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(
                                topStart = 16.dp,
                                topEnd = 16.dp,
                                bottomStart = if (isFarmer) 16.dp else 4.dp,
                                bottomEnd = if (isFarmer) 4.dp else 16.dp
                            ),
                            color = if (isFarmer) ForestGreenPrimary else CanvasSurfaceLight,
                            border = if (!isFarmer) androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight) else null,
                            shadowElevation = 1.dp,
                            modifier = Modifier.widthIn(max = 280.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = msg.content,
                                    fontSize = 14.sp,
                                    color = if (isFarmer) Color.White else EarthTextPrimary,
                                    lineHeight = 19.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (isFarmer) "You (Farmer)" else "Buyer • Re: ${msg.produceName}",
                                    fontSize = 10.sp,
                                    color = if (isFarmer) Color.White.copy(alpha = 0.7f) else EarthTextMuted
                                )
                            }
                        }
                    }
                }
            }
        }

        // Quick Reply Suggestions
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val quickReplies = listOf(
                "Yes, fresh batch ready for pickup!",
                "Bulk 10% discount is available.",
                "Harvested this morning at 6 AM."
            )
            items(quickReplies) { reply ->
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = CanvasSurfaceLight,
                    border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
                    modifier = Modifier
                        .bounceClick()
                        .clickable {
                            onSendReply(defaultFarmerName, "Harvest Order", reply)
                        }
                ) {
                    Text(
                        text = reply,
                        fontSize = 11.sp,
                        color = ForestGreenPrimary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Reply Input Bar
        Surface(
            color = CanvasSurfaceLight,
            shadowElevation = 4.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = replyText,
                    onValueChange = { replyText = it },
                    placeholder = { Text("Reply to buyer inquiry...", fontSize = 13.sp, color = EarthTextMuted) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = CanvasSurfaceVariant,
                        unfocusedContainerColor = CanvasSurfaceVariant,
                        focusedBorderColor = ForestGreenPrimary,
                        unfocusedBorderColor = Color.Transparent
                    ),
                    maxLines = 3
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = {
                        if (replyText.isNotBlank()) {
                            onSendReply(defaultFarmerName, "Harvest Order", replyText.trim())
                            replyText = ""
                        }
                    },
                    modifier = Modifier.bounceClick(),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = ForestGreenPrimary,
                        contentColor = Color.White
                    )
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Send",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// MODALS: CROP FORM & ORDER STATUS
// -----------------------------------------------------------------------------

@Composable
fun CropFormDialog(
    title: String,
    produce: ProduceEntity?,
    onDismiss: () -> Unit,
    onSave: (
        name: String,
        price: Double,
        quantity: String,
        category: String,
        unit: String,
        harvestDate: String,
        phone: String,
        location: String,
        description: String,
        isOrganic: Boolean
    ) -> Unit
) {
    var name by remember { mutableStateOf(produce?.name ?: "") }
    var priceText by remember { mutableStateOf(produce?.price?.toString() ?: "") }
    var quantity by remember { mutableStateOf(produce?.quantity ?: "") }
    var category by remember { mutableStateOf(produce?.category ?: "Vegetables") }
    var unit by remember { mutableStateOf(produce?.unit ?: "kg") }
    var harvestDate by remember { mutableStateOf(produce?.harvestDate ?: "Harvested Today") }
    var phone by remember { mutableStateOf(produce?.farmerPhone ?: "+1 555-0199") }
    var location by remember { mutableStateOf(produce?.location ?: "Green Valley, Farm #4") }
    var description by remember { mutableStateOf(produce?.description ?: "") }
    var isOrganic by remember { mutableStateOf(produce?.isOrganic ?: true) }

    val categories = listOf("Vegetables", "Fruits", "Tubers", "Honey & Dairy")
    val units = listOf("kg", "crate", "bundle", "jar")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Agriculture,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text(title, fontWeight = FontWeight.Bold, fontSize = 17.sp)
            }
        },
        text = {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Crop Name (e.g., Organic Honey Crisp Apples)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = priceText,
                            onValueChange = { priceText = it },
                            label = { Text("Price ($)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = quantity,
                            onValueChange = { quantity = it },
                            label = { Text("Available Qty") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                item {
                    Text("Category:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EarthTextPrimary)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(categories) { cat ->
                            val isSel = cat == category
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) ForestGreenPrimary else CanvasSurfaceLight,
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) ForestGreenPrimary else CanvasBorderLight),
                                modifier = Modifier
                                    .bounceClick()
                                    .clickable { category = cat }
                            ) {
                                Text(
                                    text = cat,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSel) Color.White else EarthTextPrimary,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Text("Pricing Unit:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EarthTextPrimary)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(units) { u ->
                            val isSel = u == unit
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) ForestGreenPrimary else CanvasSurfaceLight,
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSel) ForestGreenPrimary else CanvasBorderLight),
                                modifier = Modifier
                                    .bounceClick()
                                    .clickable { unit = u }
                            ) {
                                Text(
                                    text = u,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSel) Color.White else EarthTextPrimary,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = harvestDate,
                        onValueChange = { harvestDate = it },
                        label = { Text("Harvest Timing / Freshness") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Farmer Contact Phone") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Farm Location / Region") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Crop Description & Harvest Notes") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("100% Organically Grown", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EarthTextPrimary)
                        Switch(
                            checked = isOrganic,
                            onCheckedChange = { isOrganic = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = ForestGreenPrimary
                            )
                        )
                    }
                }
            }
        },
        confirmButton = {
            HarvestAccentButton(
                text = "Save Listing",
                enabled = name.isNotBlank() && (priceText.toDoubleOrNull() ?: 0.0) > 0,
                onClick = {
                    val priceVal = priceText.toDoubleOrNull() ?: 0.0
                    onSave(name, priceVal, quantity, category, unit, harvestDate, phone, location, description, isOrganic)
                }
            )
        },
        dismissButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.bounceClick()) {
                Text("Cancel", color = EarthTextSecondary)
            }
        }
    )
}

@Composable
fun UpdateOrderStatusDialog(
    transaction: TransactionEntity,
    onDismiss: () -> Unit,
    onStatusSelected: (String) -> Unit
) {
    val statuses = listOf("Confirmed", "Packed at Farm", "In Transit", "Delivered")
    var selectedStatus by remember { mutableStateOf(transaction.status) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.LocalShipping,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text("Update Fulfillment Status", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Order #${transaction.trackingCode} for ${transaction.buyerName}",
                    fontSize = 12.sp,
                    color = EarthTextSecondary
                )
                Spacer(modifier = Modifier.height(4.dp))
                statuses.forEach { statusOption ->
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedStatus == statusOption) MintContainer else CanvasSurfaceLight,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (selectedStatus == statusOption) ForestGreenPrimary else CanvasBorderLight
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .bounceClick()
                            .clickable { selectedStatus = statusOption }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedStatus == statusOption,
                                onClick = { selectedStatus = statusOption },
                                colors = RadioButtonDefaults.colors(selectedColor = ForestGreenPrimary)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = statusOption,
                                fontSize = 13.sp,
                                fontWeight = if (selectedStatus == statusOption) FontWeight.Bold else FontWeight.Normal,
                                color = EarthTextPrimary
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            HarvestAccentButton(
                text = "Apply Status",
                onClick = { onStatusSelected(selectedStatus) }
            )
        },
        dismissButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.bounceClick()) {
                Text("Cancel", color = EarthTextSecondary)
            }
        }
    )
}
