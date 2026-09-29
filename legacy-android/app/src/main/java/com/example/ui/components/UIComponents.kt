package com.example.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

// ----------------------------------------------------------------------------
// INTERACTIVE BOUNCE ANIMATION
// ----------------------------------------------------------------------------

@Composable
fun Modifier.bounceClick(): Modifier {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "bounce_scale"
    )
    return this.graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}

// ----------------------------------------------------------------------------
// 60-30-10 CARDS & CONTAINERS
// ----------------------------------------------------------------------------

@Composable
fun AgriCard(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(18.dp),
    containerColor: Color = CanvasSurfaceLight,
    borderColor: Color = CanvasBorderLight,
    elevation: Dp = 1.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) {
                    Modifier
                        .bounceClick()
                        .clickable(onClick = onClick)
                } else Modifier
            ),
        shape = shape,
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation),
        border = BorderStroke(1.dp, borderColor),
        content = content
    )
}

// ----------------------------------------------------------------------------
// 10% ACCENT CTA & 30% STRUCTURAL BUTTONS
// ----------------------------------------------------------------------------

@Composable
fun HarvestAccentButton(
    text: String,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .bounceClick()
            .height(50.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = HarvestGold,
            contentColor = Color.White,
            disabledContainerColor = HarvestGold.copy(alpha = 0.4f)
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 0.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
        )
    }
}

@Composable
fun ForestPrimaryButton(
    text: String,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .bounceClick()
            .height(50.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = ForestGreenPrimary,
            contentColor = Color.White
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp, pressedElevation = 0.dp),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp)
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(19.dp))
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )
    }
}

@Composable
fun ForestOutlineButton(
    text: String,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .bounceClick()
            .height(50.dp),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.5.dp, ForestGreenPrimary.copy(alpha = 0.7f)),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = ForestGreenPrimary
        ),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp)
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(19.dp))
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )
    }
}

// ----------------------------------------------------------------------------
// 60-30-10 BADGES & TAGS
// ----------------------------------------------------------------------------

@Composable
fun OrganicBadge(modifier: Modifier = Modifier) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MintContainer,
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Eco,
                contentDescription = null,
                tint = ForestGreenPrimary,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Organic",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MintText
            )
        }
    }
}

@Composable
fun CategoryTag(category: String, modifier: Modifier = Modifier) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = CanvasSurfaceVariant,
        modifier = modifier
    ) {
        Text(
            text = category,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = ForestGreenPrimary,
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun DirectSavingsTag(
    directPrice: Double,
    retailPrice: Double,
    unit: String,
    modifier: Modifier = Modifier
) {
    val diff = retailPrice - directPrice
    if (diff > 0.05) {
        val percent = ((diff / retailPrice) * 100).toInt()
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = HarvestGoldContainer,
            border = BorderStroke(1.dp, HarvestGold.copy(alpha = 0.4f)),
            modifier = modifier
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp)
            ) {
                Icon(
                    Icons.Default.TrendingDown,
                    contentDescription = null,
                    tint = HarvestGoldDark,
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Save $${String.format("%.2f", diff)} ($percent%)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = HarvestGoldText
                )
            }
        }
    }
}

// ----------------------------------------------------------------------------
// ANIMATED STEP PROGRESS BAR FOR SHIPMENTS
// ----------------------------------------------------------------------------

@Composable
fun AnimatedTrackingProgressBar(currentStatus: String) {
    val steps = listOf("Confirmed", "Packed", "In Transit", "Delivered")
    val activeIndex = when (currentStatus) {
        "Confirmed", "Pending" -> 0
        "Packed", "Packed at Farm" -> 1
        "In Transit" -> 2
        "Delivered" -> 3
        else -> 1
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            steps.forEachIndexed { index, stepName ->
                val isCompleted = index <= activeIndex
                val isCurrent = index == activeIndex

                // Step circle
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                isCurrent -> HarvestGold
                                isCompleted -> ForestGreenPrimary
                                else -> CanvasBorderLight
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isCompleted) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                    }
                }

                // Connecting Line between steps
                if (index < steps.size - 1) {
                    val lineActive = index < activeIndex
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(3.dp)
                            .padding(horizontal = 2.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(
                                if (lineActive) ForestGreenPrimary else CanvasBorderLight
                            )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Step text labels
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            steps.forEachIndexed { index, stepName ->
                val isCurrent = index == activeIndex
                val isCompleted = index <= activeIndex
                Text(
                    text = stepName,
                    fontSize = 11.sp,
                    fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                    color = when {
                        isCurrent -> HarvestGoldDark
                        isCompleted -> ForestGreenPrimary
                        else -> EarthTextMuted
                    }
                )
            }
        }
    }
}

// ----------------------------------------------------------------------------
// ANIMATED QUANTITY STEPPER
// ----------------------------------------------------------------------------

@Composable
fun AnimatedQuantityStepper(
    value: Int,
    unit: String,
    pricePerUnit: Double,
    onValueChange: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(CanvasSurfaceVariant)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        FilledTonalIconButton(
            onClick = { if (value > 1) onValueChange(value - 1) },
            modifier = Modifier
                .bounceClick()
                .size(36.dp),
            colors = IconButtonDefaults.filledTonalIconButtonColors(
                containerColor = CanvasSurfaceLight,
                contentColor = ForestGreenPrimary
            )
        ) {
            Icon(Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(18.dp))
        }

        AnimatedContent(
            targetState = value,
            transitionSpec = {
                if (targetState > initialState) {
                    slideInVertically { height -> height } + fadeIn() togetherWith
                            slideOutVertically { height -> -height } + fadeOut()
                } else {
                    slideInVertically { height -> -height } + fadeIn() togetherWith
                            slideOutVertically { height -> height } + fadeOut()
                }
            },
            label = "stepper_counter"
        ) { targetVal ->
            Text(
                text = "$targetVal $unit",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 16.sp,
                color = EarthTextPrimary
            )
        }

        FilledTonalIconButton(
            onClick = { onValueChange(value + 1) },
            modifier = Modifier
                .bounceClick()
                .size(36.dp),
            colors = IconButtonDefaults.filledTonalIconButtonColors(
                containerColor = CanvasSurfaceLight,
                contentColor = ForestGreenPrimary
            )
        ) {
            Icon(Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(18.dp))
        }

        Spacer(modifier = Modifier.weight(1f))

        Text(
            text = "$${String.format("%.2f", value * pricePerUnit)}",
            fontWeight = FontWeight.ExtraBold,
            fontSize = 17.sp,
            color = ForestGreenPrimary
        )
    }
}
