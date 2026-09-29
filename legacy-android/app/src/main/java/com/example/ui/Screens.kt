package com.example.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
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
fun AgriConnectApp(viewModel: MainViewModel) {
    val navController = rememberNavController()

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
        containerColor = CanvasBackgroundLight
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "role_selection",
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            enterTransition = { slideInHorizontally(initialOffsetX = { it }) + fadeIn(tween(250)) },
            exitTransition = { slideOutHorizontally(targetOffsetX = { -it }) + fadeOut(tween(200)) },
            popEnterTransition = { slideInHorizontally(initialOffsetX = { -it }) + fadeIn(tween(250)) },
            popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) + fadeOut(tween(200)) }
        ) {
            composable("role_selection") {
                RoleSelectionScreen(navController)
            }
            composable("farmer_dashboard") {
                FarmerDashboard(navController, viewModel)
            }
            composable("buyer_dashboard") {
                BuyerDashboard(navController, viewModel)
            }
            composable("admin_dashboard") {
                AdminDashboard(navController, viewModel)
            }
            composable(
                route = "product_detail/{produceId}",
                arguments = listOf(navArgument("produceId") { type = NavType.IntType })
            ) { backStackEntry ->
                val produceId = backStackEntry.arguments?.getInt("produceId") ?: return@composable
                ProductDetailScreen(produceId, navController, viewModel)
            }
        }
    }
}

// -----------------------------------------------------------------------------
// REAL-WORLD ROLE SELECTION / ONBOARDING SCREEN
// (Admin login is completely hidden from public view; accessible only via staff PIN)
// -----------------------------------------------------------------------------

@Composable
fun AgriConnectBrandMark(
    modifier: Modifier = Modifier,
    size: androidx.compose.ui.unit.Dp = 84.dp
) {
    Box(
        modifier = modifier
            .size(size)
            .shadow(
                elevation = 10.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = Color(0xFF0F3B22).copy(alpha = 0.5f)
            )
            .clip(RoundedCornerShape(24.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0D2D1B),
                        Color(0xFF14452B),
                        Color(0xFF1B5537)
                    )
                )
            )
            .border(
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.5.dp,
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF34D399),
                            Color(0xFFF59E0B)
                        )
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size * 0.72f)) {
            val w = this.size.width
            val h = this.size.height

            // Center Stem line
            val stemPath = Path().apply {
                moveTo(w * 0.5f, h * 0.88f)
                cubicTo(w * 0.5f, h * 0.62f, w * 0.5f, h * 0.42f, w * 0.5f, h * 0.28f)
            }
            drawPath(
                path = stemPath,
                color = Color.White.copy(alpha = 0.95f),
                style = Stroke(width = w * 0.055f, cap = StrokeCap.Round)
            )

            // Left Emerald Sprout Leaf
            val leftLeaf = Path().apply {
                moveTo(w * 0.5f, h * 0.80f)
                cubicTo(w * 0.46f, h * 0.68f, w * 0.20f, h * 0.62f, w * 0.16f, h * 0.44f)
                cubicTo(w * 0.14f, h * 0.30f, w * 0.34f, h * 0.26f, w * 0.48f, h * 0.36f)
                cubicTo(w * 0.51f, h * 0.38f, w * 0.51f, h * 0.44f, w * 0.50f, h * 0.50f)
                cubicTo(w * 0.42f, h * 0.54f, w * 0.36f, h * 0.64f, w * 0.50f, h * 0.76f)
                close()
            }
            drawPath(
                path = leftLeaf,
                brush = Brush.linearGradient(
                    colors = listOf(Color(0xFF34D399), Color(0xFF10B981))
                )
            )

            // Right Golden Wheat / Harvest Arc
            val rightLeaf = Path().apply {
                moveTo(w * 0.5f, h * 0.74f)
                cubicTo(w * 0.54f, h * 0.64f, w * 0.80f, h * 0.58f, w * 0.84f, h * 0.40f)
                cubicTo(w * 0.86f, h * 0.26f, w * 0.66f, h * 0.22f, w * 0.52f, h * 0.32f)
                cubicTo(w * 0.49f, h * 0.34f, w * 0.49f, h * 0.40f, w * 0.50f, h * 0.46f)
                cubicTo(w * 0.58f, h * 0.50f, w * 0.64f, h * 0.60f, w * 0.50f, h * 0.70f)
                close()
            }
            drawPath(
                path = rightLeaf,
                brush = Brush.linearGradient(
                    colors = listOf(Color(0xFFFBBF24), Color(0xFFF59E0B))
                )
            )

            // Top Connecting Network Node (Representing Direct Farmer-to-Consumer Connectivity)
            drawCircle(
                color = Color.White,
                radius = w * 0.08f,
                center = Offset(w * 0.5f, h * 0.22f)
            )
            drawCircle(
                color = Color(0xFF34D399),
                radius = w * 0.045f,
                center = Offset(w * 0.5f, h * 0.22f)
            )
        }
    }
}

@Composable
fun RoleSelectionScreen(navController: NavController) {
    var showStaffPinDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBackgroundLight),
        contentPadding = PaddingValues(bottom = 36.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            // Hero Brand Canopy (Architectural deep forest canopy with guaranteed high contrast)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp),
                color = HeroCanopyStart,
                shadowElevation = 6.dp
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    HeroCanopyStart,
                                    HeroCanopyMid,
                                    HeroCanopyEnd
                                )
                            )
                        )
                        .padding(top = 44.dp, bottom = 32.dp, start = 24.dp, end = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        // Badge: 100% Direct Trade Guarantee
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Color(0xFF071A10).copy(alpha = 0.65f),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                Color(0xFF34D399).copy(alpha = 0.35f)
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = HarvestGold,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(7.dp))
                                Text(
                                    text = "Zero Broker Commissions • 100% Direct",
                                    fontSize = 12.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = HeroTextSecondary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Modern AgriConnect Brand Emblem
                        AgriConnectBrandMark(size = 84.dp)

                        Spacer(modifier = Modifier.height(16.dp))

                        // App Brand Title with Dual Tone
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Agri",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Black,
                                color = HeroTextPrimary,
                                fontSize = 32.sp
                            )
                            Text(
                                text = "Connect",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Black,
                                color = HarvestGold,
                                fontSize = 32.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Network Subtitle Badge
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0xFF34D399).copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(
                                0.8.dp,
                                Color(0xFF34D399).copy(alpha = 0.3f)
                            )
                        ) {
                            Text(
                                text = "DIRECT FARM-TO-CONSUMER NETWORK",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF6EE7B7),
                                letterSpacing = 1.2.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Connecting local farms directly with households and restaurants for fresher harvest at fair, transparent prices.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = HeroTextMuted,
                            textAlign = TextAlign.Center,
                            lineHeight = 21.sp,
                            modifier = Modifier.padding(horizontal = 14.dp)
                        )
                    }
                }
            }
        }

        item {
            // Live Trade Highlights Banner (High contrast, readable metrics)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricPill(
                    icon = Icons.Default.Percent,
                    value = "0%",
                    label = "Middleman Fee",
                    modifier = Modifier.weight(1f)
                )
                MetricPill(
                    icon = Icons.Default.VerifiedUser,
                    value = "100%",
                    label = "Direct Escrow",
                    modifier = Modifier.weight(1f)
                )
                MetricPill(
                    icon = Icons.Default.LocalShipping,
                    value = "Direct",
                    label = "Farm Delivery",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(28.dp))
        }

        item {
            // Public User Role Cards Section (Only Buyer and Farmer are shown to public users)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "Get Started",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = EarthTextPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Select your account type to proceed into the marketplace",
                    style = MaterialTheme.typography.bodyMedium,
                    color = EarthTextSecondary
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Buyer Role Card
                RoleSelectionCard(
                    title = "I am a Buyer",
                    subtitle = "Browse farm-fresh crops, purchase at direct grower prices, and track live deliveries to your door.",
                    badge = "Popular",
                    badgeColor = HarvestGoldContainer,
                    badgeTextColor = HarvestGoldText,
                    icon = Icons.Default.ShoppingCart,
                    iconTint = HarvestGoldDark,
                    iconBg = HarvestGoldContainer,
                    onClick = { navController.navigate("buyer_dashboard") }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Farmer Role Card
                RoleSelectionCard(
                    title = "I am a Farmer",
                    subtitle = "List your fresh harvest, set fair prices, manage farm inventory, and chat directly with buyers.",
                    badge = "Direct Seller",
                    badgeColor = MintContainer,
                    badgeTextColor = MintText,
                    icon = Icons.Default.Agriculture,
                    iconTint = ForestGreenPrimary,
                    iconBg = MintContainer,
                    onClick = { navController.navigate("farmer_dashboard") }
                )
            }

            Spacer(modifier = Modifier.height(36.dp))
        }

        item {
            // Real-world Trust & Accreditation Section
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = CanvasSurfaceLight,
                border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(MintContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Verified,
                            contentDescription = null,
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Verified Agricultural Escrow",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = EarthTextPrimary
                        )
                        Text(
                            text = "Every transaction is securely held in escrow until crop quality is inspected upon delivery.",
                            fontSize = 13.sp,
                            color = EarthTextSecondary,
                            lineHeight = 18.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))
        }

        item {
            // Discreet Platform Footer with Hidden Staff Access
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "AgriConnect Direct-Trade Network • Version 1.4.2",
                    fontSize = 13.sp,
                    color = EarthTextMuted,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Hidden / Discreet Staff Portal Link
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .bounceClick()
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { showStaffPinDialog = true }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = null,
                        tint = EarthTextMuted,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Authorized Staff Access",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = EarthTextMuted
                    )
                }
            }
        }
    }

    // Modal: Authorized Staff Admin Authentication (Hidden from public)
    if (showStaffPinDialog) {
        StaffPinDialog(
            onDismiss = { showStaffPinDialog = false },
            onAuthorized = {
                showStaffPinDialog = false
                navController.navigate("admin_dashboard")
            }
        )
    }
}

@Composable
fun StaffPinDialog(
    onDismiss: () -> Unit,
    onAuthorized: () -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf(false) }
    var pinVisible by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(CanvasSurfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.AdminPanelSettings,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("Staff Verification", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                    Text("Internal Marketplace Oversight", fontSize = 12.sp, color = EarthTextMuted)
                }
            }
        },
        text = {
            Column {
                Text(
                    text = "Please enter your administrative security PIN to access the direct-trade audit console.",
                    fontSize = 14.sp,
                    color = EarthTextSecondary,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = pin,
                    onValueChange = {
                        pin = it
                        pinError = false
                    },
                    label = { Text("Staff PIN", fontSize = 14.sp) },
                    placeholder = { Text("Enter 4-digit PIN") },
                    singleLine = true,
                    isError = pinError,
                    visualTransformation = if (pinVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { pinVisible = !pinVisible }) {
                            Icon(
                                imageVector = if (pinVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle PIN",
                                tint = EarthTextSecondary
                            )
                        }
                    },
                    supportingText = {
                        if (pinError) {
                            Text("Incorrect PIN. Access denied.", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                        } else {
                            Text("Demo Staff PIN: 1234", color = EarthTextMuted, fontSize = 12.sp)
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            ForestPrimaryButton(
                text = "Authenticate",
                onClick = {
                    if (pin.trim() == "1234" || pin.trim() == "admin") {
                        onAuthorized()
                    } else {
                        pinError = true
                    }
                }
            )
        },
        dismissButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.bounceClick()) {
                Text("Cancel", color = EarthTextSecondary, fontSize = 14.sp)
            }
        }
    )
}

@Composable
fun MetricPill(
    icon: ImageVector,
    value: String,
    label: String,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = CanvasSurfaceLight,
        border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = HarvestGoldDark,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 17.sp,
                color = ForestGreenPrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = EarthTextSecondary,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun RoleSelectionCard(
    title: String,
    subtitle: String,
    badge: String,
    badgeColor: Color,
    badgeTextColor: Color,
    icon: ImageVector,
    iconTint: Color,
    iconBg: Color,
    onClick: () -> Unit
) {
    AgriCard(
        onClick = onClick,
        shape = RoundedCornerShape(20.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(30.dp),
                    tint = iconTint
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = EarthTextPrimary,
                        fontSize = 18.sp
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = badgeColor
                    ) {
                        Text(
                            text = badge,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = badgeTextColor,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = EarthTextSecondary,
                    lineHeight = 20.sp
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = ForestGreenPrimary,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}

// -----------------------------------------------------------------------------
// BUYER DASHBOARD & REAL-WORLD WORKFLOWS
// -----------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuyerDashboard(navController: NavController, viewModel: MainViewModel) {
    val produceList by viewModel.allProduce.collectAsStateWithLifecycle()
    val transactions by viewModel.allTransactions.collectAsStateWithLifecycle()
    val messages by viewModel.allMessages.collectAsStateWithLifecycle()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var selectedQuickFilter by remember { mutableStateOf<String?>(null) }
    var currentDeliveryAddress by remember { mutableStateOf("45 Market Street, Green Valley Hub") }
    var showAddressPicker by remember { mutableStateOf(false) }

    var contactTargetProduce by remember { mutableStateOf<ProduceEntity?>(null) }
    var bookingTargetProduce by remember { mutableStateOf<ProduceEntity?>(null) }
    var lastOrderPlacedNotice by remember { mutableStateOf<String?>(null) }

    val categories = listOf("All", "Vegetables", "Fruits", "Tubers", "Honey & Dairy")

    val filteredProduce = produceList.filter { produce ->
        val matchesCategory = (selectedCategory == "All" || produce.category.equals(selectedCategory, ignoreCase = true))
        val matchesSearch = searchQuery.isBlank() ||
                produce.name.contains(searchQuery, ignoreCase = true) ||
                produce.farmerName.contains(searchQuery, ignoreCase = true) ||
                produce.location.contains(searchQuery, ignoreCase = true)
        val matchesQuickFilter = when (selectedQuickFilter) {
            "Organic" -> produce.isOrganic
            "Under $4" -> produce.price < 4.0
            else -> true
        }
        matchesCategory && matchesSearch && matchesQuickFilter
    }

    Scaffold(
        containerColor = CanvasBackgroundLight,
        topBar = {
            Surface(
                color = CanvasSurfaceLight,
                shadowElevation = 2.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                ) {
                    // Header Bar with Role Return, Title, and Direct Escrow Indicator
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
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
                                text = "Buyer Marketplace",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 19.sp,
                                color = EarthTextPrimary
                            )
                            // Real-world Delivery Location Picker
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .bounceClick()
                                    .clickable { showAddressPicker = true }
                            ) {
                                Icon(
                                    Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = ForestGreenPrimary,
                                    modifier = Modifier.size(13.dp)
                                )
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = currentDeliveryAddress,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = ForestGreenPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Icon(
                                    Icons.Default.ArrowDropDown,
                                    contentDescription = null,
                                    tint = ForestGreenPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        // Direct Escrow / Sync Status
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = MintContainer
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(ForestGreenPrimary)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Direct Escrow",
                                    fontSize = 12.sp,
                                    color = MintText,
                                    fontWeight = FontWeight.Bold
                                )
                            }
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
                        Icon(
                            if (selectedTabIndex == 0) Icons.Filled.Storefront else Icons.Outlined.Storefront,
                            contentDescription = "Marketplace"
                        )
                    },
                    label = { Text("Marketplace", fontWeight = if (selectedTabIndex == 0) FontWeight.Bold else FontWeight.Normal, fontSize = 12.sp) },
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
                            Icon(
                                if (selectedTabIndex == 1) Icons.Filled.LocalShipping else Icons.Outlined.LocalShipping,
                                contentDescription = "My Orders"
                            )
                        }
                    },
                    label = { Text("My Orders", fontWeight = if (selectedTabIndex == 1) FontWeight.Bold else FontWeight.Normal, fontSize = 12.sp) },
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
                            Icon(
                                if (selectedTabIndex == 2) Icons.Filled.ChatBubble else Icons.Outlined.ChatBubbleOutline,
                                contentDescription = "Messages"
                            )
                        }
                    },
                    label = { Text("Farmer Chat", fontWeight = if (selectedTabIndex == 2) FontWeight.Bold else FontWeight.Normal, fontSize = 12.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ForestGreenPrimary,
                        selectedTextColor = ForestGreenPrimary,
                        indicatorColor = MintContainer,
                        unselectedIconColor = EarthTextSecondary,
                        unselectedTextColor = EarthTextSecondary
                    )
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
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
                label = "buyer_tabs_animation"
            ) { targetTab ->
                when (targetTab) {
                    0 -> BuyerMarketplaceTab(
                        produceList = filteredProduce,
                        searchQuery = searchQuery,
                        onSearchQueryChange = { searchQuery = it },
                        selectedCategory = selectedCategory,
                        onCategorySelect = { selectedCategory = it },
                        categories = categories,
                        selectedQuickFilter = selectedQuickFilter,
                        onQuickFilterSelect = { filter ->
                            selectedQuickFilter = if (selectedQuickFilter == filter) null else filter
                        },
                        onViewDetail = { produce ->
                            navController.navigate("product_detail/${produce.id}")
                        },
                        onQuickBook = { produce ->
                            bookingTargetProduce = produce
                        },
                        onContactFarmer = { produce ->
                            contactTargetProduce = produce
                        }
                    )
                    1 -> BuyerOrdersTab(
                        orders = transactions,
                        onContactFarmer = { farmer, phone ->
                            val intent = Intent(Intent.ACTION_DIAL).apply {
                                data = Uri.parse("tel:$phone")
                            }
                            navController.context.startActivity(intent)
                        }
                    )
                    2 -> BuyerMessagesTab(
                        messages = messages,
                        produceList = produceList,
                        onSendMessage = { farmer, crop, msg ->
                            viewModel.sendMessage(farmer, crop, msg, sender = "Buyer")
                        }
                    )
                }
            }

            // Real-world Toast Confirmation Banner
            if (lastOrderPlacedNotice != null) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = ForestGreenPrimary,
                    shadowElevation = 6.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 20.dp, start = 20.dp, end = 20.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = lastOrderPlacedNotice!!,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        IconButton(
                            onClick = { lastOrderPlacedNotice = null },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = Color.White)
                        }
                    }
                }
            }
        }
    }

    // Modal: Delivery Address Switcher
    if (showAddressPicker) {
        AlertDialog(
            onDismissRequest = { showAddressPicker = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = ForestGreenPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Select Delivery Destination", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                }
            },
            text = {
                val addresses = listOf(
                    "45 Market Street, Green Valley Hub",
                    "742 Evergreen Terrace, North District",
                    "Eco-Farm Direct Pickup Station #2"
                )
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    addresses.forEach { addr ->
                        val isSelected = addr == currentDeliveryAddress
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) MintContainer else CanvasSurfaceLight,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isSelected) ForestGreenPrimary else CanvasBorderLight
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .bounceClick()
                                .clickable {
                                    currentDeliveryAddress = addr
                                    showAddressPicker = false
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = {
                                        currentDeliveryAddress = addr
                                        showAddressPicker = false
                                    },
                                    colors = RadioButtonDefaults.colors(selectedColor = ForestGreenPrimary)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = addr,
                                    fontSize = 14.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = EarthTextPrimary
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showAddressPicker = false }) {
                    Text("Close", color = ForestGreenPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // Modal: Quick Order Booking
    if (bookingTargetProduce != null) {
        BookingCheckoutDialog(
            produce = bookingTargetProduce!!,
            onDismiss = { bookingTargetProduce = null },
            onConfirmBooking = { qty, method, address, payment, total ->
                viewModel.bookProduce(
                    produce = bookingTargetProduce!!,
                    quantity = qty,
                    deliveryMethod = method,
                    deliveryAddress = address,
                    paymentMethod = payment
                )
                lastOrderPlacedNotice = "Order confirmed for ${bookingTargetProduce!!.name}!"
                bookingTargetProduce = null
                selectedTabIndex = 1 // Switch to Orders view
            }
        )
    }

    // Modal: Contact Farmer
    if (contactTargetProduce != null) {
        ContactFarmerDialog(
            produce = contactTargetProduce!!,
            onDismiss = { contactTargetProduce = null },
            onSendMessage = { farmer, crop, msg ->
                viewModel.sendMessage(farmer, crop, msg, sender = "Buyer")
                contactTargetProduce = null
                selectedTabIndex = 2 // Switch to chat view
            }
        )
    }
}

// -----------------------------------------------------------------------------
// TAB 1: BUYER MARKETPLACE EXPLORE
// -----------------------------------------------------------------------------

@Composable
fun BuyerMarketplaceTab(
    produceList: List<ProduceEntity>,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    selectedCategory: String,
    onCategorySelect: (String) -> Unit,
    categories: List<String>,
    selectedQuickFilter: String?,
    onQuickFilterSelect: (String) -> Unit,
    onViewDetail: (ProduceEntity) -> Unit,
    onQuickBook: (ProduceEntity) -> Unit,
    onContactFarmer: (ProduceEntity) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        item {
            // Fair-Pricing Direct Guarantee Banner
            Card(
                colors = CardDefaults.cardColors(containerColor = MintContainer),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight.copy(alpha = 0.25f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(CanvasSurfaceLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.VerifiedUser,
                            contentDescription = "Fair Trade",
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Direct Producer Pricing Guaranteed",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 15.sp,
                            color = MintText
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Save up to 45% compared to supermarket markups by trading direct.",
                            fontSize = 13.sp,
                            color = ForestGreenMedium,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }

        item {
            // Modern Search Field with Clear Button
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChange,
                placeholder = { Text("Search fresh crops, farms, or regions...", fontSize = 14.sp, color = EarthTextMuted) },
                leadingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = "Search",
                        tint = ForestGreenPrimary
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { onSearchQueryChange("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = EarthTextSecondary)
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = CanvasSurfaceLight,
                    unfocusedContainerColor = CanvasSurfaceLight,
                    focusedBorderColor = ForestGreenPrimary,
                    unfocusedBorderColor = CanvasBorderLight
                ),
                singleLine = true
            )
        }

        item {
            // Category Filter Chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
            ) {
                items(categories) { category ->
                    val isSelected = category.equals(selectedCategory, ignoreCase = true)
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) ForestGreenPrimary else CanvasSurfaceLight,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) ForestGreenPrimary else CanvasBorderLight
                        ),
                        modifier = Modifier
                            .bounceClick()
                            .clickable { onCategorySelect(category) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp)
                        ) {
                            if (isSelected) {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                            }
                            Text(
                                text = category,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 14.sp,
                                color = if (isSelected) Color.White else EarthTextSecondary
                            )
                        }
                    }
                }
            }
        }

        item {
            // Quick Filter Pills (Organic, Under $4)
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 6.dp, bottom = 10.dp)
            ) {
                val quickFilters = listOf("Organic", "Under $4")
                items(quickFilters) { filter ->
                    val isSelected = selectedQuickFilter == filter
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) HarvestGoldContainer else CanvasSurfaceLight,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) HarvestGold else CanvasBorderLight
                        ),
                        modifier = Modifier
                            .bounceClick()
                            .clickable { onQuickFilterSelect(filter) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = if (filter == "Organic") Icons.Default.Eco else Icons.Default.LocalOffer,
                                contentDescription = null,
                                tint = if (isSelected) HarvestGoldDark else ForestGreenPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = filter,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) HarvestGoldText else EarthTextSecondary
                            )
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Fresh Harvest Listings",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp,
                    color = EarthTextPrimary
                )
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = CanvasSurfaceVariant
                ) {
                    Text(
                        text = "${produceList.size} available",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestGreenPrimary,
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
        }

        if (produceList.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 48.dp, start = 24.dp, end = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(76.dp)
                                .clip(CircleShape)
                                .background(CanvasSurfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.FilterAltOff,
                                contentDescription = null,
                                modifier = Modifier.size(38.dp),
                                tint = EarthTextMuted
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No crops match your filter",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = EarthTextPrimary,
                            fontSize = 17.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Try clearing your search query or switching categories.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = EarthTextSecondary,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(18.dp))
                        ForestOutlineButton(
                            text = "Reset Filters",
                            icon = Icons.Default.Refresh,
                            onClick = {
                                onSearchQueryChange("")
                                onCategorySelect("All")
                            }
                        )
                    }
                }
            }
        } else {
            items(produceList, key = { it.id }) { produce ->
                BuyerProduceCard(
                    produce = produce,
                    onViewDetail = { onViewDetail(produce) },
                    onQuickBook = { onQuickBook(produce) },
                    onContactFarmer = { onContactFarmer(produce) }
                )
                Spacer(modifier = Modifier.height(14.dp))
            }
        }
    }
}

@Composable
fun BuyerProduceCard(
    produce: ProduceEntity,
    onViewDetail: () -> Unit,
    onQuickBook: () -> Unit,
    onContactFarmer: () -> Unit
) {
    AgriCard(
        onClick = onViewDetail,
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Top Row: Category tag, Organic tag & Pricing
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CategoryTag(produce.category)
                    if (produce.isOrganic) {
                        OrganicBadge()
                    }
                }

                // Price display with clear typography
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format("%.2f", produce.price)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 22.sp,
                        color = ForestGreenPrimary
                    )
                    Text(
                        text = "per ${produce.unit}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = EarthTextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Crop Name & Harvest Metadata
            Text(
                text = produce.name,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                color = EarthTextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Schedule,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = produce.harvestDate,
                        fontSize = 13.sp,
                        color = EarthTextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                }

                Text("•", color = CanvasBorderLight, fontSize = 14.sp)

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Inventory2,
                        contentDescription = null,
                        tint = HarvestGoldDark,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${produce.quantity} in stock",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = HarvestGoldText
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Middleman Price Comparison & Direct Savings Tag
            if (produce.middlemanPrice > produce.price) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Supermarket: ",
                            fontSize = 13.sp,
                            color = EarthTextSecondary
                        )
                        Text(
                            text = "$${String.format("%.2f", produce.middlemanPrice)}/${produce.unit}",
                            fontSize = 13.sp,
                            textDecoration = TextDecoration.LineThrough,
                            color = EarthTextMuted
                        )
                    }

                    DirectSavingsTag(
                        directPrice = produce.price,
                        retailPrice = produce.middlemanPrice,
                        unit = produce.unit
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Farmer & Location Row with rating
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = CanvasSurfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = produce.farmerName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.Verified,
                        contentDescription = "Verified Grower",
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(15.dp)
                    )

                    Spacer(modifier = Modifier.weight(1f))

                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = EarthTextSecondary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = produce.location,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = EarthTextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons: Contact & Book Crop
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ForestOutlineButton(
                    text = "Contact",
                    icon = Icons.Default.PhoneInTalk,
                    modifier = Modifier.weight(1f),
                    onClick = onContactFarmer
                )

                HarvestAccentButton(
                    text = "Book Crop",
                    icon = Icons.Default.ShoppingCart,
                    modifier = Modifier.weight(1.3f),
                    onClick = onQuickBook
                )
            }
        }
    }
}

// -----------------------------------------------------------------------------
// TAB 2: BUYER ORDERS & REAL-TIME TRACKING
// -----------------------------------------------------------------------------

@Composable
fun BuyerOrdersTab(
    orders: List<TransactionEntity>,
    onContactFarmer: (farmerName: String, farmerPhone: String) -> Unit
) {
    if (orders.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.LocalShipping,
                        contentDescription = null,
                        modifier = Modifier.size(42.dp),
                        tint = ForestGreenPrimary
                    )
                }
                Spacer(modifier = Modifier.height(18.dp))
                Text(
                    text = "No Orders Placed Yet",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = EarthTextPrimary,
                    fontSize = 20.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "When you book produce from local farmers, live tracking milestones and direct farm dispatch details will appear here.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = EarthTextSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Real-world Live Delivery Notification Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = MintContainer),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight.copy(alpha = 0.25f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(CanvasSurfaceLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.DirectionsRun,
                                contentDescription = null,
                                tint = ForestGreenPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = "Estimated Delivery: Today, 4:30 PM",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp,
                                color = MintText
                            )
                            Text(
                                text = "Direct courier dispatched from Green Valley farm depot.",
                                fontSize = 13.sp,
                                color = ForestGreenMedium
                            )
                        }
                    }
                }
            }

            item {
                Text(
                    text = "Active Shipments (${orders.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp,
                    color = EarthTextPrimary
                )
            }

            items(orders, key = { it.id }) { order ->
                BuyerOrderCard(
                    order = order,
                    onContactFarmer = {
                        onContactFarmer(order.farmerName, "+1 555-0199")
                    }
                )
            }
        }
    }
}

@Composable
fun BuyerOrderCard(
    order: TransactionEntity,
    onContactFarmer: () -> Unit
) {
    AgriCard {
        Column(modifier = Modifier.padding(18.dp)) {
            // Header Row: Tracking code & Status badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Tracking ID: ${order.trackingCode}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 14.sp,
                        color = ForestGreenPrimary
                    )
                    Text(
                        text = SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.getDefault()).format(Date(order.timestamp)),
                        fontSize = 12.sp,
                        color = EarthTextSecondary
                    )
                }

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
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (order.status) {
                            "Delivered" -> ForestGreenPrimary
                            "In Transit" -> HarvestGoldText
                            else -> EarthTextPrimary
                        },
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Order Content Summary
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.produceName,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 17.sp,
                        color = EarthTextPrimary
                    )
                    Text(
                        text = "Farmer: ${order.farmerName}",
                        fontSize = 14.sp,
                        color = EarthTextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "Quantity: ${order.quantityOrdered}",
                        fontSize = 14.sp,
                        color = EarthTextSecondary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format("%.2f", order.amount)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = ForestGreenPrimary
                    )
                    Text(
                        text = order.paymentMethod,
                        fontSize = 11.sp,
                        color = EarthTextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Animated Real-Time Shipment Progress Tracker
            AnimatedTrackingProgressBar(currentStatus = order.status)

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = CanvasBorderLight)
            Spacer(modifier = Modifier.height(12.dp))

            // Delivery Destination & Farmer Contact
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        Icons.Default.Place,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = order.deliveryAddress,
                        fontSize = 13.sp,
                        color = EarthTextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Button(
                    onClick = onContactFarmer,
                    modifier = Modifier.bounceClick(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Call Farmer", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// TAB 3: BUYER MESSAGES & INQUIRIES
// -----------------------------------------------------------------------------

@Composable
fun BuyerMessagesTab(
    messages: List<MessageEntity>,
    produceList: List<ProduceEntity>,
    onSendMessage: (farmerName: String, cropName: String, message: String) -> Unit
) {
    var selectedFarmer by remember {
        mutableStateOf(produceList.firstOrNull()?.farmerName ?: "Mateo Gutierrez")
    }
    var messageText by remember { mutableStateOf("") }

    val farmers = remember(produceList) {
        val set = produceList.map { it.farmerName }.toMutableSet()
        if (set.isEmpty()) set.add("Mateo Gutierrez")
        set.toList()
    }

    val activeMessages = messages.filter { it.farmerName.equals(selectedFarmer, ignoreCase = true) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Farmer Selector Strip
        Surface(
            color = CanvasSurfaceLight,
            shadowElevation = 1.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "Direct Grower Conversations",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = EarthTextSecondary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp)
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(farmers) { farmer ->
                        val isSelected = farmer == selectedFarmer
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) ForestGreenPrimary else CanvasSurfaceVariant,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isSelected) ForestGreenPrimary else CanvasBorderLight
                            ),
                            modifier = Modifier
                                .bounceClick()
                                .clickable { selectedFarmer = farmer }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.AccountCircle,
                                    contentDescription = null,
                                    tint = if (isSelected) Color.White else ForestGreenPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = farmer,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else EarthTextPrimary
                                )
                            }
                        }
                    }
                }
            }
        }

        // Chat Message Thread
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (activeMessages.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No messages yet with $selectedFarmer.\nAsk about harvest freshness, batch quantities, or farm pickup!",
                            textAlign = TextAlign.Center,
                            fontSize = 14.sp,
                            color = EarthTextSecondary,
                            lineHeight = 20.sp
                        )
                    }
                }
            } else {
                items(activeMessages, key = { it.id }) { msg ->
                    val isBuyer = msg.sender.equals("Buyer", ignoreCase = true)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isBuyer) Arrangement.End else Arrangement.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(
                                topStart = 16.dp,
                                topEnd = 16.dp,
                                bottomStart = if (isBuyer) 16.dp else 4.dp,
                                bottomEnd = if (isBuyer) 4.dp else 16.dp
                            ),
                            color = if (isBuyer) ForestGreenPrimary else CanvasSurfaceLight,
                            border = if (!isBuyer) androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight) else null,
                            shadowElevation = 1.dp,
                            modifier = Modifier.widthIn(max = 290.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = msg.content,
                                    fontSize = 15.sp,
                                    color = if (isBuyer) Color.White else EarthTextPrimary,
                                    lineHeight = 21.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (isBuyer) "You" else selectedFarmer,
                                    fontSize = 11.sp,
                                    color = if (isBuyer) Color.White.copy(alpha = 0.8f) else EarthTextMuted
                                )
                            }
                        }
                    }
                }
            }
        }

        // Quick Suggestion Prompt Chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val quickPrompts = listOf(
                "Is bulk order discount available?",
                "Can I arrange direct pickup this weekend?",
                "When was the latest batch harvested?"
            )
            items(quickPrompts) { prompt ->
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = CanvasSurfaceLight,
                    border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
                    modifier = Modifier
                        .bounceClick()
                        .clickable {
                            onSendMessage(selectedFarmer, "Inquiry", prompt)
                        }
                ) {
                    Text(
                        text = prompt,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = ForestGreenPrimary,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                    )
                }
            }
        }

        // Message Input Box
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
                    value = messageText,
                    onValueChange = { messageText = it },
                    placeholder = { Text("Write message to $selectedFarmer...", fontSize = 14.sp, color = EarthTextMuted) },
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
                        if (messageText.isNotBlank()) {
                            onSendMessage(selectedFarmer, "Inquiry", messageText.trim())
                            messageText = ""
                        }
                    },
                    modifier = Modifier.bounceClick(),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = HarvestGold,
                        contentColor = Color.White
                    )
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Send",
                        modifier = Modifier.size(19.dp)
                    )
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// PRODUCT DETAIL SCREEN WITH DIRECT PRICING & CALL ACTION
// -----------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(produceId: Int, navController: NavController, viewModel: MainViewModel) {
    val produceList by viewModel.allProduce.collectAsStateWithLifecycle()
    val produce = produceList.find { it.id == produceId }
    val context = LocalContext.current

    var showBookingDialog by remember { mutableStateOf(false) }
    var showContactDialog by remember { mutableStateOf(false) }

    if (produce == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(CanvasBackgroundLight),
            contentAlignment = Alignment.Center
        ) {
            Text("Crop listing not found.", style = MaterialTheme.typography.titleLarge)
        }
        return
    }

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
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.bounceClick()
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = ForestGreenPrimary)
                    }
                    Text(
                        text = produce.name,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = EarthTextPrimary,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    IconButton(
                        onClick = { showContactDialog = true },
                        modifier = Modifier.bounceClick()
                    ) {
                        Icon(Icons.Default.PhoneInTalk, contentDescription = "Contact Farmer", tint = ForestGreenPrimary)
                    }
                }
            }
        },
        bottomBar = {
            Surface(
                color = CanvasSurfaceLight,
                shadowElevation = 8.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
                modifier = Modifier.navigationBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Direct Farm Price",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = EarthTextSecondary
                        )
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = "$${String.format("%.2f", produce.price)}",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = ForestGreenPrimary
                            )
                            Text(
                                text = " / ${produce.unit}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = EarthTextSecondary
                            )
                        }
                    }

                    HarvestAccentButton(
                        text = "Book Fresh Crop",
                        icon = Icons.Default.ShoppingCart,
                        modifier = Modifier.widthIn(min = 180.dp),
                        onClick = { showBookingDialog = true }
                    )
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBackgroundLight)
        ) {
            item {
                // Organic Artistic Harvest Showcase Banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp)
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    ForestGreenPrimary,
                                    ForestGreenMedium
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .clip(CircleShape)
                                .background(CanvasSurfaceLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = when (produce.category) {
                                    "Fruits" -> Icons.Default.Eco
                                    "Honey & Dairy" -> Icons.Default.WaterDrop
                                    "Tubers" -> Icons.Default.Spa
                                    else -> Icons.Default.Agriculture
                                },
                                contentDescription = "Produce Icon",
                                modifier = Modifier.size(50.dp),
                                tint = ForestGreenPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CategoryTag(produce.category)
                            if (produce.isOrganic) {
                                OrganicBadge()
                            }
                        }
                    }
                }
            }

            item {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Title & Rating
                    Text(
                        text = produce.name,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = EarthTextPrimary,
                        fontSize = 24.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = HarvestGoldContainer
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = HarvestGoldDark, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(3.dp))
                                Text("4.9 (42 reviews)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = HarvestGoldText)
                            }
                        }

                        Text("•", color = CanvasBorderLight)

                        Text(
                            text = "Harvested: ${produce.harvestDate}",
                            fontSize = 13.sp,
                            color = EarthTextSecondary,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Direct Fair Pricing Comparison Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MintContainer),
                        shape = RoundedCornerShape(16.dp),
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
                                        text = "Direct Producer Price",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MintText
                                    )
                                    Text(
                                        text = "$${String.format("%.2f", produce.price)} / ${produce.unit}",
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = ForestGreenPrimary
                                    )
                                }

                                if (produce.middlemanPrice > produce.price) {
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "Supermarket Retail",
                                            fontSize = 13.sp,
                                            color = EarthTextSecondary
                                        )
                                        Text(
                                            text = "$${String.format("%.2f", produce.middlemanPrice)}",
                                            fontSize = 16.sp,
                                            textDecoration = TextDecoration.LineThrough,
                                            color = EarthTextMuted
                                        )
                                    }
                                }
                            }

                            if (produce.middlemanPrice > produce.price) {
                                Spacer(modifier = Modifier.height(10.dp))
                                DirectSavingsTag(
                                    directPrice = produce.price,
                                    retailPrice = produce.middlemanPrice,
                                    unit = produce.unit
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(22.dp))

                    // Producer & Farm Details Card
                    Text(
                        text = "Producer & Farm Information",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    AgriCard {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape)
                                        .background(MintContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.AccountCircle,
                                        contentDescription = null,
                                        modifier = Modifier.size(32.dp),
                                        tint = ForestGreenPrimary
                                    )
                                }
                                Spacer(modifier = Modifier.width(14.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = produce.farmerName,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 17.sp,
                                            color = EarthTextPrimary
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Icon(
                                            Icons.Default.Verified,
                                            contentDescription = "Verified Grower",
                                            tint = ForestGreenPrimary,
                                            modifier = Modifier.size(17.dp)
                                        )
                                    }
                                    Text(
                                        text = produce.location,
                                        fontSize = 14.sp,
                                        color = EarthTextSecondary
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                ForestOutlineButton(
                                    text = "Call Farmer",
                                    icon = Icons.Default.Call,
                                    modifier = Modifier.weight(1f),
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_DIAL).apply {
                                            data = Uri.parse("tel:${produce.farmerPhone}")
                                        }
                                        context.startActivity(intent)
                                    }
                                )

                                ForestPrimaryButton(
                                    text = "Send Inquiry",
                                    icon = Icons.Default.Chat,
                                    modifier = Modifier.weight(1f),
                                    onClick = { showContactDialog = true }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(22.dp))

                    // Harvest Specifications
                    Text(
                        text = "Harvest & Quality Specifications",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        SpecBox(
                            label = "Current Stock",
                            value = produce.quantity,
                            icon = Icons.Default.Inventory2,
                            modifier = Modifier.weight(1f)
                        )
                        SpecBox(
                            label = "Harvest Timing",
                            value = produce.harvestDate,
                            icon = Icons.Default.Event,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(22.dp))

                    // Description
                    Text(
                        text = "About this Harvest",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = produce.description.ifBlank {
                            "Freshly harvested ${produce.name} cultivated directly by ${produce.farmerName} in ${produce.location}. Packaged without preservative sprays to retain pristine natural flavor and essential nutrients."
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = EarthTextSecondary,
                        lineHeight = 23.sp,
                        fontSize = 15.sp
                    )

                    Spacer(modifier = Modifier.height(28.dp))
                }
            }
        }
    }

    // Booking Dialog
    if (showBookingDialog) {
        BookingCheckoutDialog(
            produce = produce,
            onDismiss = { showBookingDialog = false },
            onConfirmBooking = { qty, method, address, payment, total ->
                viewModel.bookProduce(
                    produce = produce,
                    quantity = qty,
                    deliveryMethod = method,
                    deliveryAddress = address,
                    paymentMethod = payment
                )
                showBookingDialog = false
                navController.popBackStack()
            }
        )
    }

    // Contact Dialog
    if (showContactDialog) {
        ContactFarmerDialog(
            produce = produce,
            onDismiss = { showContactDialog = false },
            onSendMessage = { farmer, crop, msg ->
                viewModel.sendMessage(farmer, crop, msg, sender = "Buyer")
                showContactDialog = false
            }
        )
    }
}

@Composable
fun SpecBox(
    label: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = CanvasSurfaceLight,
        border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = ForestGreenPrimary,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = label,
                fontSize = 12.sp,
                color = EarthTextSecondary
            )
            Text(
                text = value,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 15.sp,
                color = EarthTextPrimary
            )
        }
    }
}

// -----------------------------------------------------------------------------
// CHECKOUT & CONTACT DIALOGS
// -----------------------------------------------------------------------------

@Composable
fun BookingCheckoutDialog(
    produce: ProduceEntity,
    onDismiss: () -> Unit,
    onConfirmBooking: (
        quantity: Int,
        deliveryMethod: String,
        deliveryAddress: String,
        paymentMethod: String,
        totalAmount: Double
    ) -> Unit
) {
    var quantityValue by remember { mutableIntStateOf(1) }
    var deliveryMethod by remember { mutableStateOf("Direct Farm Delivery") }
    var deliveryAddress by remember { mutableStateOf("45 Market Street, Green Valley Hub") }
    var paymentMethod by remember { mutableStateOf("Direct Farm Escrow") }

    val deliveryFee = when (deliveryMethod) {
        "Direct Farm Delivery" -> 3.00
        "Regional Agri-Hub" -> 1.50
        else -> 0.00
    }
    val grandTotal = (quantityValue * produce.price) + deliveryFee

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.ShoppingCartCheckout,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("Complete Direct Order", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                    Text("Direct Escrow Settlement", fontSize = 12.sp, color = ForestGreenPrimary, fontWeight = FontWeight.SemiBold)
                }
            }
        },
        text = {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    Text(
                        text = produce.name,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = EarthTextPrimary
                    )
                    Text(
                        text = "From ${produce.farmerName} • $${String.format("%.2f", produce.price)}/${produce.unit}",
                        fontSize = 13.sp,
                        color = EarthTextSecondary
                    )
                }

                item {
                    Text(
                        text = "Select Quantity:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    AnimatedQuantityStepper(
                        value = quantityValue,
                        unit = produce.unit,
                        pricePerUnit = produce.price,
                        onValueChange = { quantityValue = it },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    Text(
                        text = "Fulfillment Option:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    val options = listOf(
                        "Direct Farm Delivery" to "+$3.00",
                        "Regional Agri-Hub" to "+$1.50",
                        "Direct Farm Pickup" to "Free"
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        options.forEach { (option, priceTag) ->
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (deliveryMethod == option) MintContainer else CanvasSurfaceLight,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (deliveryMethod == option) ForestGreenPrimary else CanvasBorderLight
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .bounceClick()
                                    .clickable { deliveryMethod = option }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = deliveryMethod == option,
                                        onClick = { deliveryMethod = option },
                                        colors = RadioButtonDefaults.colors(selectedColor = ForestGreenPrimary)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = option,
                                        fontSize = 14.sp,
                                        fontWeight = if (deliveryMethod == option) FontWeight.Bold else FontWeight.Medium,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Text(
                                        text = priceTag,
                                        fontSize = 13.sp,
                                        color = ForestGreenPrimary,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                item {
                    Text(
                        text = "Delivery Destination:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EarthTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = deliveryAddress,
                        onValueChange = { deliveryAddress = it },
                        placeholder = { Text("Enter delivery address / hub...", fontSize = 14.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }

                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MintContainer,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Total Payable (Direct Escrow):",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MintText
                            )
                            Text(
                                text = "$${String.format("%.2f", grandTotal)}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 21.sp,
                                color = ForestGreenPrimary
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            HarvestAccentButton(
                text = "Confirm Order",
                onClick = {
                    onConfirmBooking(quantityValue, deliveryMethod, deliveryAddress, paymentMethod, grandTotal)
                }
            )
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.bounceClick()
            ) {
                Text("Cancel", color = EarthTextSecondary, fontSize = 14.sp)
            }
        }
    )
}

@Composable
fun ContactFarmerDialog(
    produce: ProduceEntity,
    onDismiss: () -> Unit,
    onSendMessage: (farmer: String, crop: String, msg: String) -> Unit
) {
    var inquiryText by remember { mutableStateOf("") }
    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(MintContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.PhoneInTalk,
                        contentDescription = null,
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text("Contact ${produce.farmerName}", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            }
        },
        text = {
            Column {
                Text(
                    text = "Direct line to producer for ${produce.name}.",
                    fontSize = 14.sp,
                    color = EarthTextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Direct Call Option
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = CanvasSurfaceLight,
                    border = androidx.compose.foundation.BorderStroke(1.dp, CanvasBorderLight),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Phone / WhatsApp", fontSize = 12.sp, color = EarthTextMuted)
                            Text(produce.farmerPhone, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                        Button(
                            onClick = {
                                val intent = Intent(Intent.ACTION_DIAL).apply {
                                    data = Uri.parse("tel:${produce.farmerPhone}")
                                }
                                context.startActivity(intent)
                            },
                            modifier = Modifier.bounceClick(),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                        ) {
                            Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(15.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Dial", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text("Send In-App Inquiry:", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = EarthTextPrimary)
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = inquiryText,
                    onValueChange = { inquiryText = it },
                    placeholder = { Text("Ask about custom crate sizes, inspection, or delivery schedule...", fontSize = 13.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    maxLines = 4
                )
            }
        },
        confirmButton = {
            HarvestAccentButton(
                text = "Send Message",
                enabled = inquiryText.isNotBlank(),
                onClick = {
                    if (inquiryText.isNotBlank()) {
                        onSendMessage(produce.farmerName, produce.name, inquiryText.trim())
                    }
                }
            )
        },
        dismissButton = {
            TextButton(onClick = onDismiss, modifier = Modifier.bounceClick()) {
                Text("Close", color = EarthTextSecondary, fontSize = 14.sp)
            }
        }
    )
}

// -----------------------------------------------------------------------------
// ADMIN DASHBOARD (Accessible only via Authorized Staff Portal PIN verification)
// -----------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboard(navController: NavController, viewModel: MainViewModel) {
    val transactions by viewModel.allTransactions.collectAsStateWithLifecycle()
    val produceList by viewModel.allProduce.collectAsStateWithLifecycle()

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
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.bounceClick()
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = ForestGreenPrimary)
                    }
                    Text(
                        text = "Admin & Market Oversight",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 19.sp,
                        color = EarthTextPrimary
                    )
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Analytics Summary Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MintContainer),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight.copy(alpha = 0.25f))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        "Marketplace Direct Trade Volume",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = MintText,
                        fontSize = 15.sp
                    )
                    val totalVolume = transactions.sumOf { it.amount }
                    Text(
                        text = "$${String.format("%.2f", totalVolume)}",
                        fontSize = 30.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = ForestGreenPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Active Harvest Batches: ${produceList.size}", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = ForestGreenMedium)
                        Text("Total Orders: ${transactions.size}", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = ForestGreenMedium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
            Text(
                "Transaction Audit & Fulfillment Ledger",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                color = EarthTextPrimary
            )
            Spacer(modifier = Modifier.height(10.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(transactions, key = { it.id }) { tx ->
                    AgriCard {
                        Row(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(tx.produceName, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = EarthTextPrimary)
                                Text("Buyer: ${tx.buyerName} (${tx.quantityOrdered})", fontSize = 14.sp, color = EarthTextSecondary)
                                Text("Delivery: ${tx.deliveryMethod}", fontSize = 13.sp, color = EarthTextSecondary)
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = MintContainer,
                                    modifier = Modifier.padding(top = 4.dp)
                                ) {
                                    Text(
                                        text = "${tx.status} • ${tx.trackingCode}",
                                        fontSize = 12.sp,
                                        color = ForestGreenPrimary,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                                    )
                                }
                            }
                            Text(
                                "$${String.format("%.2f", tx.amount)}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 19.sp,
                                color = ForestGreenPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
