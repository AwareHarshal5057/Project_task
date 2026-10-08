document.addEventListener('DOMContentLoaded', function() {
    // Detect if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 767;
    
    const canvas = document.getElementById('efficiencyChart');
    if (!canvas) {
        console.error('Canvas element with id "efficiencyChart" not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Unable to get 2D context from canvas');
        return;
    }

    // Set canvas size for sharp rendering with proper DPR handling
    function setCanvasSize() {
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Get device pixel ratio for sharp rendering
        // Force higher DPR for desktop to match mobile crispness
        const screenWidth = window.innerWidth;
        let dpr = window.devicePixelRatio || 1;
        
        // Force higher DPR on desktop for sharper rendering
        if (screenWidth > 767) {
            dpr = Math.max(dpr, 2); // Ensure at least 2x DPR on desktop
        }
        
        // Use container height for proper proportions
        const height = containerRect.height || 500;
        
        // For mobile, use responsive width calculation
        let canvasWidth;
        
        if (screenWidth <= 480) {
            canvasWidth = Math.max(screenWidth * 2.5, 600); // Smaller minimum for mobile
        } else if (screenWidth <= 767) {
            canvasWidth = Math.max(screenWidth * 1.8, 700); // Medium for tablets
        } else {
            canvasWidth = Math.max(containerRect.width, 800); // Desktop
        }
        
        // Set CSS dimensions
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = height + 'px';
        
        // Set actual canvas dimensions with DPR scaling for sharp rendering
        canvas.width = canvasWidth * dpr;
        canvas.height = height * dpr;
        
        // Scale the context to ensure correct drawing operations
        ctx.scale(dpr, dpr);
        
        // Enable anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }

    // Call this before creating the chart
    setCanvasSize();

    // Check if ChartDataLabels is available before registering
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    } else {
        console.warn('ChartDataLabels plugin not found, continuing without it');
    }

// Plugin to draw extended grid lines
const extendedGridLinesPlugin = {
    id: 'extendedGridLines',
    beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const yScale = chart.scales.y;
        const xScale = chart.scales.x;
        
        ctx.save();
        
        // Draw extended horizontal grid lines
        yScale.ticks.forEach((tick) => {
            const y = yScale.getPixelForValue(tick.value);
            
            // Draw the extended part (bold and black)
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(chartArea.left - 8, y); // Extend 8px to the left
            ctx.lineTo(chartArea.left, y);
            ctx.stroke();
            
            // Draw the regular part (light gray)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();
        });
        
        // Draw extended vertical grid lines at the center of each bar group (between Target and Achievement)
        const labels = chart.data.labels;
        const targetMeta = chart.getDatasetMeta(0); // Target dataset
        const achievementMeta = chart.getDatasetMeta(1); // Achievement dataset
        
        if (labels && labels.length > 0 && targetMeta.data && targetMeta.data.length > 0) {
            // Draw vertical lines at the center of each bar group
            targetMeta.data.forEach((targetBar, index) => {
                const achievementBar = achievementMeta.data[index];
                
                // Get positions of both bars
                const targetProps = targetBar.getProps(['x', 'width']);
                const achievementProps = achievementBar.getProps(['x', 'width']);
                
                // Calculate the center point between the two bars
                const targetRightEdge = targetProps.x + targetProps.width/2;
                const achievementLeftEdge = achievementProps.x - achievementProps.width/2;
                const centerX = (targetRightEdge + achievementLeftEdge) / 2;
                
                // Draw the extended part (bold and black)
                ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(centerX, chartArea.bottom); // Start at bottom
                ctx.lineTo(centerX, chartArea.bottom + 8); // Extend 8px down
                ctx.stroke();
            });
        }
        
        ctx.restore();
    }
};

// Plugin to draw axis arrows and labels
const axisArrowPlugin = {
    id: 'axisArrow',
    afterDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        
        ctx.save();
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#666';
        
        // Y-axis line
        ctx.beginPath();
        ctx.moveTo(chartArea.left, chartArea.bottom);
        ctx.lineTo(chartArea.left, chartArea.top - 20);
        ctx.stroke();
        
        // Y-axis arrow
        ctx.beginPath();
        ctx.moveTo(chartArea.left, chartArea.top - 20);
        ctx.lineTo(chartArea.left - 4, chartArea.top - 12);
        ctx.lineTo(chartArea.left + 4, chartArea.top - 12);
        ctx.closePath();
        ctx.fill();
        
        // X-axis line
        ctx.beginPath();
        ctx.moveTo(chartArea.left, chartArea.bottom);
        ctx.lineTo(chartArea.right + 10, chartArea.bottom);
        ctx.stroke();
        
        // X-axis arrow
        ctx.beginPath();
        ctx.moveTo(chartArea.right + 10, chartArea.bottom);
        ctx.lineTo(chartArea.right + 2, chartArea.bottom - 4);
        ctx.lineTo(chartArea.right + 2, chartArea.bottom + 4);
        ctx.closePath();
        ctx.fill();

        // Draw Hours label aligned with Y-axis scale labels
        ctx.save();
        const hoursText = 'Hours';
        const screenWidth = window.innerWidth;
        // Match font size to scale font size
        let hoursFontSize = chart.options.scales.y.ticks.font.size;
        
        // Get Y-axis label position to align with scale labels
        const yAxisLabelX = chartArea.left - chart.options.scales.y.ticks.padding - 0;
        const hoursY = chartArea.top - 40; // Increased margin to prevent overlap with bubbles
        
        // Draw background pill for Hours label
        ctx.font = `${hoursFontSize}px 'Euclid Circular A', Arial, sans-serif`;
        const hoursMetrics = ctx.measureText(hoursText);
        const hoursPadding = 8;
        const hoursBoxWidth = hoursMetrics.width + hoursPadding * 2;
        const hoursBoxHeight = hoursFontSize + 6;
        
        // Draw pill background
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        const radius = hoursBoxHeight / 2;
        ctx.roundRect(yAxisLabelX - hoursBoxWidth/2, hoursY - hoursBoxHeight/2, hoursBoxWidth, hoursBoxHeight, radius);
        ctx.fill();
        
        // Draw text
        ctx.fillStyle = '#808080';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hoursText, yAxisLabelX, hoursY);
        
        // Draw Business Cycle label aligned with X-axis scale labels
        const businessText = 'Business Cycle 2024 - 2025';
        // Match font size to scale font size
        let businessFontSize = chart.options.scales.y.ticks.font.size;
        

        // Position: just after the x-axis arrow
        const businessX = chartArea.right + 20;  // 10px right of arrow
        const xAxisLabelY = chartArea.bottom;

        // Draw background pill
        ctx.font = `${businessFontSize}px 'Euclid Circular A', Arial, sans-serif`;
        const businessMetrics = ctx.measureText(businessText);
        const businessPadding = 12;
        const businessBoxWidth = businessMetrics.width + businessPadding * 2;
        const businessBoxHeight = businessFontSize + 6;

        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        const businessRadius = businessBoxHeight / 2;
        ctx.roundRect(
        businessX,                               // start at right of arrow
        xAxisLabelY - businessBoxHeight / 2,
        businessBoxWidth,
        businessBoxHeight,
        businessRadius
        );
        ctx.fill();

        // Draw text (left-aligned inside pill)
        ctx.fillStyle = '#333';  // dark text
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(businessText, businessX + businessPadding, xAxisLabelY);

        ctx.restore();
        // Get X-axis label position to align with scale labels (now between bars)
        // const businessX = chartArea.left + (chartArea.right - chartArea.left) / 2;
        // const xAxisLabelY = chartArea.bottom + 50; // Position below the custom labels with margin
        
        // // Draw background pill for Business Cycle label
        // ctx.font = `${businessFontSize}px 'Euclid Circular A', Arial, sans-serif`;
        // const businessMetrics = ctx.measureText(businessText);
        // const businessPadding = 12;
        // const businessBoxWidth = businessMetrics.width + businessPadding * 2;
        // const businessBoxHeight = businessFontSize + 6;
        
        // // Draw pill background
        // ctx.fillStyle = '#f5f5f5';
        // ctx.beginPath();
        // const businessRadius = businessBoxHeight / 2;
        // ctx.roundRect(businessX - businessBoxWidth/2, xAxisLabelY - businessBoxHeight/2, businessBoxWidth, businessBoxHeight, businessRadius);
        // ctx.fill();
        
        // // Draw text
        // ctx.fillStyle = '#808080';
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        // ctx.fillText(businessText, businessX, xAxisLabelY);
        
        // ctx.restore();

        // Hide the HTML labels since we're drawing them on canvas now
        const hoursLabel = document.querySelector('.hours-label');
        const businessCycleLabel = document.querySelector('.business-cycle');

        if (hoursLabel) {
            hoursLabel.style.display = 'none';
        }

        if (businessCycleLabel) {
            businessCycleLabel.style.display = 'none';
        }

        ctx.restore();
    }
};

// Plugin to draw value labels on bars
const barLabelsPlugin = {
    id: 'barLabels',
    afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        // Save the current context state
        ctx.save();

        // Get both datasets
        const targetDataset = chart.data.datasets[0];
        const achievementDataset = chart.data.datasets[1];
        const targetMeta = chart.getDatasetMeta(0);
        const achievementMeta = chart.getDatasetMeta(1);

        // Draw labels for each data point
        targetMeta.data.forEach((targetBar, index) => {
            const achievementBar = achievementMeta.data[index];
            
            // Get properties for both bars
            const targetProps = targetBar.getProps(['x', 'y', 'base', 'width']);
            const achievementProps = achievementBar.getProps(['x', 'y', 'base', 'width']);
            
            const barWidth = targetProps.width;
            const x = targetProps.x;
            
            // Draw Target text - inside the target bar, 70px from bottom
            const targetValue = targetDataset.data[index];
            const fontSize = window.innerWidth <= 480 ? 10 : window.innerWidth <= 767 ? 11 : 12;
            const fontWeight = 'normal'; // Always regular weight for desktop and mobile
            
            // Position inside the target bar using actual bar boundaries
            const targetBarCenterX = targetProps.x;
            const targetLabelY = targetProps.base - 70;
            
            ctx.save();
            ctx.translate(targetBarCenterX, targetLabelY);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#793C91'; // Purple text for target
            ctx.font = `${fontWeight} ${fontSize}px 'Euclid Circular A', Arial, sans-serif`;
            ctx.fillText(targetValue, 0, 0);
            ctx.restore();
            
            // Draw Achievement text - inside the achievement bar, 70px from bottom
            const achievementValue = achievementDataset.data[index];
            
            // Position inside the achievement bar using actual bar boundaries
            const achievementBarCenterX = achievementProps.x;
            const achievementLabelY = achievementProps.base - 70;
            
            ctx.save();
            ctx.translate(achievementBarCenterX, achievementLabelY);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white'; // White text for achievement
            ctx.font = `${fontWeight} ${fontSize}px 'Euclid Circular A', Arial, sans-serif`;
            ctx.fillText(achievementValue, 0, 0);
            ctx.restore();
        });
        
        // Restore the context state
        ctx.restore();
    }
};

// Plugin to add shadows to chart points
const pointShadowPlugin = {
    id: 'pointShadow',
    beforeDatasetsDraw: function(chart) {
        const ctx = chart.ctx;

        // Find the line dataset
        const lineDataset = chart.data.datasets.find(d => d.type === 'line');
        if (!lineDataset) return;

        const lineIndex = chart.data.datasets.indexOf(lineDataset);
        const meta = chart.getDatasetMeta(lineIndex);

        ctx.save();

        // Set shadow properties - reduced for subtle effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw shadow for each point
        meta.data.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = lineDataset.pointBackgroundColor;
            ctx.fill();

            // Draw border
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = lineDataset.pointBorderColor;
            ctx.lineWidth = lineDataset.pointBorderWidth;
            ctx.stroke();
        });

        ctx.restore();
    }
};

// Track clicked state and hover state
let isLineClicked = true;
let isLineHovered = false;

// Custom plugin for speech bubble labels with dotted lines on mobile
const speechBubblePlugin = {
    id: 'speechBubble',
    afterDatasetsDraw: (chart, args, options) => {
        const lineDataset = chart.data.datasets.find(d => d.type === 'line');
        if (!lineDataset) return;

        const lineIndex = chart.data.datasets.indexOf(lineDataset);
        const meta = chart.getDatasetMeta(lineIndex);

        const ctx = chart.ctx;
        const screenWidth = window.innerWidth;
        
        // Show bubbles when hovered or clicked (click persists until clicked again)
        const shouldShowBubbles = isLineClicked || isLineHovered;
        
        // If conditions not met, don't show any bubbles
        if (!shouldShowBubbles) return;

        // Save context state to ensure proper clipping
        ctx.save();

        // Get responsive bubble dimensions
        let bubbleWidth, bubbleHeight, fontSize, useDottedLines, bubbleSpacing;

        if (screenWidth <= 480) {
            bubbleWidth = 48;  // Increased from 40
            bubbleHeight = 18; // Increased from 14
            fontSize = 10;     // Increased from 7 for better readability
            useDottedLines = true;
            bubbleSpacing = 8; // Reduced spacing for mobile
        } else if (screenWidth <= 767) {
            bubbleWidth = 52;  // Increased from 45
            bubbleHeight = 20; // Increased from 16
            fontSize = 11;     // Increased from 8 for better readability
            useDottedLines = true;
            bubbleSpacing = 10;
        } else {
            bubbleWidth = 65;
            bubbleHeight = 22;
            fontSize = 11;
            useDottedLines = false;
            bubbleSpacing = 0;
        }

        // Calculate bubble positions to avoid overlap on mobile
        const bubblePositions = [];
        if (useDottedLines) {
            const chartTop = chart.chartArea.top;
            const chartHeight = chart.chartArea.bottom - chart.chartArea.top;
            
            // Stagger bubbles in two rows for mobile to better utilize horizontal space
            const rows = screenWidth <= 480 ? 2 : 1;
            const bubblesPerRow = Math.ceil(meta.data.length / rows);
            
            meta.data.forEach((point, index) => {
                let row = 0;
                let positionInRow = index;
                
                if (rows === 2) {
                    row = index % 2;
                    positionInRow = Math.floor(index / 2);
                }
                
                const yOffset = row * (bubbleHeight + bubbleSpacing * 2);
                // Calculate base Y position with proper margin from chart top
                const totalBubblesHeight = rows * (bubbleHeight + bubbleSpacing * 2);
                const minTopMargin = 20; // Minimum margin from canvas top
                const baseY = Math.max(chartTop - 80 - totalBubblesHeight, minTopMargin);
                
                bubblePositions.push({
                    x: point.x,
                    y: baseY + yOffset,
                    pointY: point.y,
                    index: index
                });
            });
        }

        meta.data.forEach((point, index) => {
            // Get achievement and target values to calculate percentage
            const achievementValue = chart.data.datasets.find(d => d.label === 'Achievement').data[index];
            const targetValue = chart.data.datasets.find(d => d.label === 'Target').data[index];
            const achievementPercentage = ((achievementValue / targetValue) * 100).toFixed(1);
            const x = point.x;
            let bubbleY, pointY;

            if (useDottedLines) {
                const bubblePos = bubblePositions.find(pos => pos.index === index);
                if (!bubblePos) return; // Skip if no position found
                bubbleY = bubblePos.y;
                pointY = point.y;
            } else {
                bubbleY = point.y - (bubbleHeight + 25); // Increased from 15 to 25 for more space
                pointY = point.y;
            }

            // Bubble dimensions
            const width = bubbleWidth;
            const height = bubbleHeight;
            const radius = height/2;

            ctx.save();

            // Draw dotted line on mobile
            if (useDottedLines && bubbleY < pointY - 10) {
                ctx.beginPath();
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = 'rgba(147, 88, 161, 0.6)';
                ctx.lineWidth = 1;
                ctx.moveTo(x, bubbleY + height);
                ctx.lineTo(x, pointY - 6);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw unified bubble shape
            ctx.beginPath();

            if (useDottedLines) {
                // Simple rounded rectangle for mobile (no pointer)
                // Manual rounded rectangle since roundRect might not be available
                ctx.moveTo(x - width/2 + radius, bubbleY);
                ctx.lineTo(x + width/2 - radius, bubbleY);
                ctx.arc(x + width/2 - radius, bubbleY + radius, radius, -Math.PI/2, 0);
                ctx.lineTo(x + width/2, bubbleY + height - radius);
                ctx.arc(x + width/2 - radius, bubbleY + height - radius, radius, 0, Math.PI/2);
                ctx.lineTo(x - width/2 + radius, bubbleY + height);
                ctx.arc(x - width/2 + radius, bubbleY + height - radius, radius, Math.PI/2, Math.PI);
                ctx.lineTo(x - width/2, bubbleY + radius);
                ctx.arc(x - width/2 + radius, bubbleY + radius, radius, Math.PI, -Math.PI/2);
            } else {
                // Unified bubble with integrated pointer for desktop
                const triangleHeight = 6; // Smaller triangle
                const triangleWidth = 4; // Smaller triangle width

                // Create smooth rounded bubble with integrated pointer
                // Start from top-left corner
                ctx.moveTo(x - width/2 + radius, bubbleY);

                // Top side
                ctx.lineTo(x + width/2 - radius, bubbleY);
                ctx.arc(x + width/2 - radius, bubbleY + radius, radius, -Math.PI/2, 0);

                // Right side
                ctx.lineTo(x + width/2, bubbleY + height - radius);
                ctx.arc(x + width/2 - radius, bubbleY + height - radius, radius, 0, Math.PI/2);

                // Bottom right to pointer start
                ctx.lineTo(x + triangleWidth, bubbleY + height);

                // Pointer
                ctx.lineTo(x, bubbleY + height + triangleHeight);
                ctx.lineTo(x - triangleWidth, bubbleY + height);

                // Bottom left from pointer
                ctx.lineTo(x - width/2 + radius, bubbleY + height);
                ctx.arc(x - width/2 + radius, bubbleY + height - radius, radius, Math.PI/2, Math.PI);

                // Left side
                ctx.lineTo(x - width/2, bubbleY + radius);
                ctx.arc(x - width/2 + radius, bubbleY + radius, radius, Math.PI, -Math.PI/2);
            }

            ctx.closePath();

            // Fill and stroke with higher z-index appearance
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = '#793C91'; // Changed to match text color
            ctx.lineWidth = screenWidth <= 480 ? 1 : 1.5;
            ctx.stroke();

            // Add shadow for better visibility (z-index effect) - reduced for subtle effect
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;

            // Add text with non-bold purple style for percentage
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#793C91';
            ctx.font = `${fontSize}px 'Euclid Circular A', Arial, sans-serif`; // Removed bold
            
            // Calculate text position with slight downward adjustment
            const textY = bubbleY + height/2 + 1; // Added 1px downward adjustment
            
            // Draw the number part
            const numberText = achievementPercentage;
            const percentSign = '%';
            
            // Measure text widths
            const numberWidth = ctx.measureText(numberText).width;
            const percentWidth = ctx.measureText(percentSign).width;
            const totalWidth = numberWidth + percentWidth;
            
            // Draw number
            ctx.fillText(numberText, x - percentWidth/2, textY);
            
            // Draw % sign with opacity
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.fillText(percentSign, x + numberWidth/2, textY);
            ctx.restore();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.restore();
        });
        
        // Restore context state
        ctx.restore();
    }
};

// Plugin to add gap between first bar and Y-axis
const gapPlugin = {
    id: 'gapPlugin',
    beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const meta = chart.getDatasetMeta(0); // Get first dataset meta
        
        if (meta.data && meta.data.length > 0) {
            const firstBar = meta.data[0];
            const barProps = firstBar.getProps(['x', 'width']);
            
            // Responsive gap width - increased spacing for better visual separation
            const screenWidth = window.innerWidth;
            const gapWidth = screenWidth <= 767 ? 25 : 20; // Increased from 15/10 to 25/20
            
            // Draw white rectangle to create visual gap
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(
                chartArea.left - 1,
                chartArea.top - 5,
                gapWidth + 1,
                chartArea.bottom - chartArea.top + 10
            );
            ctx.restore();
        }
    }
};

// Plugin to draw X-axis labels aligned with the center of bar groups
const xAxisLabelsPlugin = {
    id: 'xAxisLabels',
    afterDraw: function(chart) {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const labels = chart.data.labels;
        const targetMeta = chart.getDatasetMeta(0); // Target dataset
        const achievementMeta = chart.getDatasetMeta(1); // Achievement dataset
        
        if (!labels || labels.length === 0 || !targetMeta.data || targetMeta.data.length === 0) return;
        
        ctx.save();
        
        const screenWidth = window.innerWidth;
        let fontSize = screenWidth <= 480 ? 8 : screenWidth <= 767 ? 9 : screenWidth <= 1024 ? 10 : 11;
        let maxRotation = 0; // No rotation on any screen size
        
        ctx.font = `${fontSize}px 'Euclid Circular A', Arial, sans-serif`;
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Draw labels at the center between target and achievement bars
        targetMeta.data.forEach((targetBar, index) => {
            const achievementBar = achievementMeta.data[index];
            
            // Get x positions of both bars
            const targetProps = targetBar.getProps(['x']);
            const achievementProps = achievementBar.getProps(['x']);
            
            // Calculate the center point between the two bars
            const labelX = (targetProps.x + achievementProps.x) / 2;
            
            const labelY = chartArea.bottom + 10;
            const label = labels[index];
            
            ctx.save();
            
            if (maxRotation > 0) {
                // Rotate labels for mobile
                ctx.translate(labelX, labelY);
                ctx.rotate((maxRotation * Math.PI) / 180);
                ctx.textAlign = 'right';
                ctx.fillText(label, 0, 0);
            } else {
                // Horizontal labels for desktop
                ctx.fillText(label, labelX, labelY);
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }
};

Chart.register(extendedGridLinesPlugin);
Chart.register(gapPlugin);
Chart.register(axisArrowPlugin);
Chart.register(xAxisLabelsPlugin);
Chart.register(speechBubblePlugin);
Chart.register(barLabelsPlugin);

// Generate realistic 12-month demo data
const generateDemoData = () => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Target hours (varying throughout the year, accounting for holidays and business cycles)
    const targetHours = [160, 152, 168, 160, 156, 144, 140, 164, 168, 172, 160, 148];

    // Achievement hours (some exceed target, some fall short - realistic scenario)
    const achievementHours = [170, 145, 185, 168, 149, 138, 125, 178, 182, 165, 171, 156];

    // Calculate achievement percentages based on actual achievement vs target
    const achievementPercentages = targetHours.map((target, index) => {
        return Math.round((achievementHours[index] / target) * 100 * 100) / 100;
    });

    //     const months = [
    //     'Jan'
    // ];

    // // Target hours (varying throughout the year, accounting for holidays and business cycles)
    // const targetHours = [160];

    // // Achievement hours (some exceed target, some fall short - realistic scenario)
    // const achievementHours = [170];

    // // //Calculate achievement percentages based on actual achievement vs target
    // const achievementPercentages = targetHours.map((target, index) => {
    //     return Math.round((achievementHours[index] / target) * 100 * 100) / 100;
    // });

    return {
        months,
        targetHours,
        achievementHours,
        achievementPercentages
    };
};

const demoData = generateDemoData();

const isSingleData = demoData.months.length === 1;

const baseBarSettings = isSingleData
  ? { barThickness: 60, maxBarThickness: 60 }
  : {
      barPercentage: getResponsiveSettings().barPercentage || 1.0,
      categoryPercentage: getResponsiveSettings().categoryPercentage,
    };

const data = {
  labels: demoData.months,
  datasets: [
    {
      label: 'Target',
      data: demoData.targetHours,
      backgroundColor: '#A29BD3', // Light purple
      borderColor: '#A29BD3',
      order: 2,
      hoverBackgroundColor: '#A29BD3',
      hoverBorderColor: '#A29BD3',
      datalabels: { display: false },
      ...baseBarSettings,
    },
    {
      label: 'Achievement',
      data: demoData.achievementHours,
      backgroundColor: '#793C91', // Dark purple
      borderColor: '#793C91',
      order: 2,
      hoverBackgroundColor: '#793C91',
      hoverBorderColor: '#793C91',
      datalabels: { display: false },
      ...baseBarSettings,
    },
    {
      label: 'ACH%',
      data: demoData.achievementHours, // Align with bar heights
      type: 'line',
      borderColor: '#009245',
      borderWidth: 1.5,
      fill: false,
      tension: 0.4,
      order: 1,
      yAxisID: 'y', // Use same scale as bars
      pointRadius: 5,
      pointBackgroundColor: '#793C91',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHitRadius: 10,
      hoverBorderWidth: 3,
      datalabels: { display: false },
    },
  ],
};


function getResponsiveSettings() {
    const width = window.innerWidth;

    if (width <= 480) {
        // Small mobile - increased top padding to prevent bubble cutoff
        return {
            fontSize: 8,
            padding: { top: 100, right: 10, bottom: 60, left: 15 },
            tickPadding: 8,
            stepSize: 40,
            maxRotation: 0,
            categoryPercentage: 0.7, // Reduced for narrower bars
            barPercentage: 1.0 // Set to 1.0 to make bars touch each other
        };
    } else if (width <= 767) {
        // Large mobile - increased top padding to prevent bubble cutoff
        return {
            fontSize: 9,
            padding: { top: 100, right: 20, bottom: 65, left: 25 },
            tickPadding: 10,
            stepSize: 20,
            maxRotation: 0,
            categoryPercentage: 0.65, // Reduced for narrower bars
            barPercentage: 1.0 // Set to 1.0 to make bars touch each other
        };
    } else if (width <= 1024) {
        // Tablet - increased left padding for better spacing
        return {
            fontSize: 10,
            padding: { top: 80, right: 50, bottom: 70, left: 55 },
            tickPadding: 12,
            stepSize: 20,
            maxRotation: 0,
            categoryPercentage: 0.55, // Reduced for narrower bars
            barPercentage: 1.0 // Set to 1.0 to make bars touch each other
        };
    } else {
        // Desktop - increased left padding for better spacing
        return {
            fontSize: 11,
            padding: { top: 80, right: 190, bottom: 75, left: 60 },
            tickPadding: 12,
            stepSize: 20,
            maxRotation: 0,
            categoryPercentage: 0.5, // Reduced for narrower bars
            barPercentage: 1.0 // Set to 1.0 to make bars touch each other
        };
    }
}

const responsiveSettings = getResponsiveSettings();

const config = {
    type: 'bar',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },

        // Force higher DPR on desktop for crisp rendering
        devicePixelRatio: window.innerWidth > 767 ? Math.max(window.devicePixelRatio || 1, 2) : (window.devicePixelRatio || 1),
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'], // Remove 'contextmenu' to disable right-click
        resizeDelay: 100, // Add delay to prevent frequent resizes
        font: {
            family: "'Euclid Circular A', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            lineHeight: 1.2
        },
        onHover: (event, activeElements) => {
            // Removed hover effect that changes bar colors
        },
        hover: {
            mode: null // Disable hover mode
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            datalabels: {
                display: true
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: Math.max(...demoData.targetHours, ...demoData.achievementHours) + 20,
                position: 'left',
                grid: {
                    display: false, // Disable default grid lines, we'll use our custom plugin
                    drawBorder: false,
                    drawTicks: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: responsiveSettings.fontSize,
                        family: "'Euclid Circular A', Arial, sans-serif"
                    },
                    padding: responsiveSettings.tickPadding, // Use responsive padding
                    stepSize: responsiveSettings.stepSize,
                    crossAlign: 'far', // Align ticks to the far edge
                    mirror: false // Ensure labels are on the correct side
                },
                border: {
                    display: false
                }
            },

            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                    drawTicks: false
                },
                offset: true, // Keep offset true for proper bar positioning
                ticks: {
                    display: false // Hide default labels, we'll draw them manually
                },
                border: {
                    display: false
                }
            }
        },
        layout: {
            padding: responsiveSettings.padding
        }
    }
};

    // Register custom plugins
    Chart.register(extendedGridLinesPlugin, gapPlugin, barLabelsPlugin, pointShadowPlugin, axisArrowPlugin, xAxisLabelsPlugin, speechBubblePlugin);

    // Initialize the chart
    let chart;
    try {
        // Add visibility lock to prevent blinking
        canvas.style.visibility = 'hidden';
        
        // Ensure crisp rendering for Chart.js
        Chart.defaults.font.family = "'Euclid Circular A', Arial, sans-serif";
        Chart.defaults.responsive = true; // Let Chart.js handle responsive sizing
        Chart.defaults.maintainAspectRatio = false;
        
        // Set default anti-aliasing for all charts
        Chart.defaults.elements.line.borderCapStyle = 'round';
        Chart.defaults.elements.line.borderJoinStyle = 'round';
        
        // Force pixel-perfect rendering on desktop
        if (window.innerWidth > 767) {
            Chart.defaults.devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);
        }
        
        chart = new Chart(ctx, config);
        
        // Force high-quality rendering after chart creation
        if (chart.ctx) {
            chart.ctx.imageSmoothingEnabled = true;
            chart.ctx.imageSmoothingQuality = 'high';
            // Additional rendering hints
            chart.ctx.lineJoin = 'round';
            chart.ctx.lineCap = 'round';
        }
        
        // Make visible after chart is ready
        requestAnimationFrame(() => {
            canvas.style.visibility = 'visible';
            // Force a redraw with high quality settings
            chart.update('none');
        });
        
        console.log('Chart initialized successfully');
    } catch (error) {
        console.error('Error initializing chart:', error);
        canvas.style.visibility = 'visible';
        return;
    }

    // Add hover event handlers
    canvas.addEventListener('mousemove', function(event) {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const hoveredElements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, false);
        
        // Find the line dataset
        const lineDatasetIndex = chart.data.datasets.findIndex(d => d.type === 'line');
        if (lineDatasetIndex === -1) return;
        
        const meta = chart.getDatasetMeta(lineDatasetIndex);
        let lineHovered = false;
        
        // Check if hovering over line points with 10px radius
        lineHovered = hoveredElements.some(element => {
            const dataset = chart.data.datasets[element.datasetIndex];
            if (dataset.type === 'line') {
                // Check if within 10px of the point
                const point = meta.data[element.index];
                const distance = Math.sqrt(
                    Math.pow(canvasPosition.x - point.x, 2) +
                    Math.pow(canvasPosition.y - point.y, 2)
                );
                return distance <= 10;
            }
            return false;
        });
        
        // If not hovering over a point, check if hovering near the line segments
        if (!lineHovered && meta.data.length > 1) {
            for (let i = 0; i < meta.data.length - 1; i++) {
                const point1 = meta.data[i];
                const point2 = meta.data[i + 1];
                
                // Calculate distance from mouse to line segment
                const distToSegment = distanceToLineSegment(
                    canvasPosition.x, canvasPosition.y,
                    point1.x, point1.y,
                    point2.x, point2.y
                );
                
                if (distToSegment <= 10) {
                    lineHovered = true;
                    break;
                }
            }
        }
        
        if (lineHovered !== isLineHovered) {
            isLineHovered = lineHovered;
            chart.update('none');
        }
    });
    
    // Helper function to calculate distance from point to line segment
    function distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener('mouseout', function(event) {
        isLineHovered = false;
        chart.update('none');
    });

    // Add click event handler
    canvas.addEventListener('click', function(event) {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const clickedElements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, false);
        
        // Find the line dataset
        const lineDatasetIndex = chart.data.datasets.findIndex(d => d.type === 'line');
        if (lineDatasetIndex === -1) return;
        
        const meta = chart.getDatasetMeta(lineDatasetIndex);
        let lineClicked = false;
        
        // Check if a line point was clicked with 10px radius
        lineClicked = clickedElements.some(element => {
            const dataset = chart.data.datasets[element.datasetIndex];
            if (dataset.type === 'line') {
                // Check if within 10px of the point
                const point = meta.data[element.index];
                const distance = Math.sqrt(
                    Math.pow(canvasPosition.x - point.x, 2) +
                    Math.pow(canvasPosition.y - point.y, 2)
                );
                return distance <= 10;
            }
            return false;
        });
        
        // If not clicking a point, check if clicking near the line segments
        if (!lineClicked && meta.data.length > 1) {
            for (let i = 0; i < meta.data.length - 1; i++) {
                const point1 = meta.data[i];
                const point2 = meta.data[i + 1];
                
                // Calculate distance from click to line segment
                const distToSegment = distanceToLineSegment(
                    canvasPosition.x, canvasPosition.y,
                    point1.x, point1.y,
                    point2.x, point2.y
                );
                
                if (distToSegment <= 10) {
                    lineClicked = true;
                    break;
                }
            }
        }
        
        if (lineClicked) {
            // Toggle the clicked state
            isLineClicked = !isLineClicked;
            chart.update('none');
        } else {
            // If clicked elsewhere, hide bubbles only if they were clicked (not just hovered)
            if (isLineClicked) {
                isLineClicked = false;
                chart.update('none');
            }
        }
    });

    // Handle window resize for better responsiveness
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        // Only trigger resize if dimensions actually changed significantly
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        if (Math.abs(currentWidth - lastWidth) < 10 && Math.abs(currentHeight - lastHeight) < 10) {
            return;
        }
        
        lastWidth = currentWidth;
        lastHeight = currentHeight;
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Get new responsive settings
            const newSettings = getResponsiveSettings();

            // Update chart options
            chart.options.scales.y.ticks.font.size = newSettings.fontSize;
            chart.options.scales.y.ticks.padding = newSettings.tickPadding;
            chart.options.scales.y.ticks.stepSize = newSettings.stepSize;
            chart.options.scales.x.ticks.font.size = newSettings.fontSize;
            chart.options.scales.x.ticks.padding = newSettings.tickPadding;
            chart.options.scales.x.ticks.maxRotation = newSettings.maxRotation;
            chart.options.layout.padding = newSettings.padding;

            // Update dataset category percentages
            chart.data.datasets[0].categoryPercentage = newSettings.categoryPercentage;
            chart.data.datasets[1].categoryPercentage = newSettings.categoryPercentage;

            // Update data label font sizes if datalabels plugin is available
            if (chart.data.datasets[0].datalabels) {
                const dataLabelSize = window.innerWidth <= 480 ? 10 : window.innerWidth <= 767 ? 11 : 12;
                chart.data.datasets[0].datalabels.font.size = dataLabelSize;
                chart.data.datasets[1].datalabels.font.size = dataLabelSize;
            }

            // Force crisp rendering on resize
            if (chart.ctx) {
                chart.ctx.imageSmoothingEnabled = true;
                chart.ctx.imageSmoothingQuality = 'high';
                chart.ctx.lineJoin = 'round';
                chart.ctx.lineCap = 'round';
            }
            
            // Resize the chart properly
            chart.resize();
            
            // Update the chart with animation disabled for crisp rendering
            chart.update('none');
        }, 250);
    });
    
    // Disable right-click context menu on chart
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Prevent resize during scroll on mobile
    let scrollTimeout;
    let isScrolling = false;
    let lastScrollY = window.scrollY;
    
    // More robust scroll detection
    const scrollHandler = function() {
        const currentScrollY = window.scrollY;
        
        // Only set scrolling if actually scrolled vertically
        if (Math.abs(currentScrollY - lastScrollY) > 5) {
            isScrolling = true;
            lastScrollY = currentScrollY;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                isScrolling = false;
            }, 300); // Increased timeout for mobile
        }
    };
    
    // Add scroll listeners with proper options
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('touchmove', scrollHandler, { passive: true });
    
    // Prevent chart updates during scroll on mobile
    if (isMobile) {
        const originalUpdate = chart.update;
        chart.update = function(mode) {
            if (!isScrolling) {
                // Lock visibility during update to prevent flicker
                const wasVisible = canvas.style.visibility;
                if (mode !== 'none') {
                    canvas.style.visibility = 'hidden';
                }
                
                originalUpdate.call(chart, mode);
                
                if (mode !== 'none') {
                    requestAnimationFrame(() => {
                        canvas.style.visibility = wasVisible || 'visible';
                    });
                }
            }
        };
    }
    
    // Debounce resize events more aggressively on mobile
    const resizeHandler = window.onresize;
    window.onresize = function(event) {
        if (!isScrolling && !isMobile) {
            if (resizeHandler) resizeHandler.call(window, event);
        } else if (isMobile) {
            // On mobile, only resize if orientation changed
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            const orientationChanged = (lastWidth > lastHeight) !== (newWidth > newHeight);
            
            if (orientationChanged) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    if (resizeHandler) resizeHandler.call(window, event);
                }, 500);
            }
        }
    };
}); // End of DOMContentLoaded"