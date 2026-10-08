// Register Chart.js plugins before DOM loads
if (typeof Chart !== 'undefined') {
    // Plugin to draw axis arrows and labels for wave chart
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

            // Draw Achievement % label aligned with Y-axis
            ctx.save();
            const achievementText = 'Achievement %';
            const screenWidth = window.innerWidth;
            let achievementFontSize = 11;
            
            const yAxisLabelX = chartArea.left - 30;
            const achievementY = chartArea.top - 40;
            
            // Draw background pill for Achievement label
            ctx.font = `${achievementFontSize}px 'Euclid Circular A', Arial, sans-serif`;
            const achievementMetrics = ctx.measureText(achievementText);
            const achievementPadding = 8;
            const achievementBoxWidth = achievementMetrics.width + achievementPadding * 2;
            const achievementBoxHeight = achievementFontSize + 6;
            
            // Draw pill background
            ctx.fillStyle = '#f5f5f5';
            ctx.beginPath();
            const radius = achievementBoxHeight / 2;
            if (ctx.roundRect) {
                ctx.roundRect(yAxisLabelX - achievementBoxWidth/2, achievementY - achievementBoxHeight/2, achievementBoxWidth, achievementBoxHeight, radius);
            } else {
                // Fallback for browsers without roundRect
                ctx.moveTo(yAxisLabelX - achievementBoxWidth/2 + radius, achievementY - achievementBoxHeight/2);
                ctx.lineTo(yAxisLabelX + achievementBoxWidth/2 - radius, achievementY - achievementBoxHeight/2);
                ctx.arc(yAxisLabelX + achievementBoxWidth/2 - radius, achievementY - achievementBoxHeight/2 + radius, radius, -Math.PI/2, 0);
                ctx.lineTo(yAxisLabelX + achievementBoxWidth/2, achievementY + achievementBoxHeight/2 - radius);
                ctx.arc(yAxisLabelX + achievementBoxWidth/2 - radius, achievementY + achievementBoxHeight/2 - radius, radius, 0, Math.PI/2);
                ctx.lineTo(yAxisLabelX - achievementBoxWidth/2 + radius, achievementY + achievementBoxHeight/2);
                ctx.arc(yAxisLabelX - achievementBoxWidth/2 + radius, achievementY + achievementBoxHeight/2 - radius, radius, Math.PI/2, Math.PI);
                ctx.lineTo(yAxisLabelX - achievementBoxWidth/2, achievementY - achievementBoxHeight/2 + radius);
                ctx.arc(yAxisLabelX - achievementBoxWidth/2 + radius, achievementY - achievementBoxHeight/2 + radius, radius, Math.PI, -Math.PI/2);
            }
            ctx.fill();
            
            // Draw text
            ctx.fillStyle = '#808080';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(achievementText, yAxisLabelX, achievementY);
            
            // Draw Business Cycle label aligned with X-axis
            const businessText = 'Business Cycle 2024 - 2025';
            let businessFontSize = 11;
            
            // const businessX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            // const xAxisLabelY = chartArea.bottom + 50;
            const businessX = chartArea.right + 100
            const xAxisLabelY = chartArea.bottom;
            
            // Draw background pill for Business Cycle label
            ctx.font = `${businessFontSize}px 'Euclid Circular A', Arial, sans-serif`;
            const businessMetrics = ctx.measureText(businessText);
            const businessPadding = 12;
            const businessBoxWidth = businessMetrics.width + businessPadding * 2;
            const businessBoxHeight = businessFontSize + 6;
            
            // Draw pill background
            ctx.fillStyle = '#f5f5f5';
            ctx.beginPath();
            const businessRadius = businessBoxHeight / 2;
            if (ctx.roundRect) {
                ctx.roundRect(businessX - businessBoxWidth/2, xAxisLabelY - businessBoxHeight/2, businessBoxWidth, businessBoxHeight, businessRadius);
            } else {
                // Fallback for browsers without roundRect
                ctx.moveTo(businessX - businessBoxWidth/2 + businessRadius, xAxisLabelY - businessBoxHeight/2);
                ctx.lineTo(businessX + businessBoxWidth/2 - businessRadius, xAxisLabelY - businessBoxHeight/2);
                ctx.arc(businessX + businessBoxWidth/2 - businessRadius, xAxisLabelY - businessBoxHeight/2 + businessRadius, businessRadius, -Math.PI/2, 0);
                ctx.lineTo(businessX + businessBoxWidth/2, xAxisLabelY + businessBoxHeight/2 - businessRadius);
                ctx.arc(businessX + businessBoxWidth/2 - businessRadius, xAxisLabelY + businessBoxHeight/2 - businessRadius, businessRadius, 0, Math.PI/2);
                ctx.lineTo(businessX - businessBoxWidth/2 + businessRadius, xAxisLabelY + businessBoxHeight/2);
                ctx.arc(businessX - businessBoxWidth/2 + businessRadius, xAxisLabelY + businessBoxHeight/2 - businessRadius, businessRadius, Math.PI/2, Math.PI);
                ctx.lineTo(businessX - businessBoxWidth/2, xAxisLabelY - businessBoxHeight/2 + businessRadius);
                ctx.arc(businessX - businessBoxWidth/2 + businessRadius, xAxisLabelY - businessBoxHeight/2 + businessRadius, businessRadius, Math.PI, -Math.PI/2);
            }
            ctx.fill();
            
            // Draw text
            ctx.fillStyle = '#808080';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(businessText, businessX, xAxisLabelY);
            
            ctx.restore();
            ctx.restore();
        }
    };

    // Plugin to draw extended grid lines
    const extendedGridLinesPlugin = {
        id: 'extendedGridLines',
        beforeDraw: function(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;
            
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
            
            // Draw extended vertical grid lines for X-axis
            const xScale = chart.scales.x;
            const meta = chart.getDatasetMeta(0);
            
            if (meta.data && meta.data.length > 0) {
                meta.data.forEach((point, index) => {
                    const x = point.x;
                    
                    // Draw the extended part (bold and black)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, chartArea.bottom);
                    ctx.lineTo(x, chartArea.bottom + 8); // Extend 8px down
                    ctx.stroke();
                });
            }
            
            ctx.restore();
        }
    };

    // Plugin to add gap between first data point and Y-axis
    const gapPlugin = {
        id: 'gapPlugin',
        beforeDraw: function(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);
            
            if (meta.data && meta.data.length > 0) {
                // Responsive gap width
                const screenWidth = window.innerWidth;
                const gapWidth = screenWidth <= 767 ? 25 : 20;
                
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

    // Plugin to draw X-axis labels
    const xAxisLabelsPlugin = {
        id: 'xAxisLabels',
        afterDraw: function(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const meta = chart.getDatasetMeta(0);
            
            if (!meta.data || meta.data.length === 0) return;
            
            ctx.save();
            
            const screenWidth = window.innerWidth;
            let fontSize = screenWidth <= 480 ? 8 : screenWidth <= 767 ? 9 : screenWidth <= 1024 ? 10 : 11;
            
            ctx.font = `${fontSize}px 'Euclid Circular A', Arial, sans-serif`;
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Draw labels for each data point
            meta.data.forEach((point, index) => {
                if (index < labels.length) {
                    const labelX = point.x;
                    const labelY = chartArea.bottom + 10;
                    ctx.fillText(labels[index], labelX, labelY);
                }
            });
            
            ctx.restore();
        }
    };

    // Track clicked state and hover state for speech bubbles
    let isLineClicked = false;
    let isLineHovered = false;

    // Custom plugin for speech bubble labels
    const speechBubblePlugin = {
        id: 'speechBubble',
        afterDatasetsDraw: (chart, args, options) => {
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            const ctx = chart.ctx;
            const screenWidth = window.innerWidth;
            
            // Show bubbles when hovered or clicked
            const shouldShowBubbles = window.isLineClicked || window.isLineHovered;
            
            
            if (!shouldShowBubbles) return;

            ctx.save();

            // Get responsive bubble dimensions
            let bubbleWidth, bubbleHeight, fontSize;

            if (screenWidth <= 480) {
                bubbleWidth = 48;
                bubbleHeight = 18;
                fontSize = 10;
            } else if (screenWidth <= 767) {
                bubbleWidth = 52;
                bubbleHeight = 20;
                fontSize = 11;
            } else {
                bubbleWidth = 65;
                bubbleHeight = 22;
                fontSize = 11;
            }

            meta.data.forEach((point, index) => {
                const value = dataset.data[index];
                const x = point.x;
                const bubbleY = point.y - (bubbleHeight + 25);

                // Bubble dimensions
                const width = bubbleWidth;
                const height = bubbleHeight;
                const radius = height/2;

                ctx.save();

                // Draw bubble with pointer
                ctx.beginPath();
                
                const triangleHeight = 6;
                const triangleWidth = 4;

                // Create smooth rounded bubble with integrated pointer
                ctx.moveTo(x - width/2 + radius, bubbleY);
                ctx.lineTo(x + width/2 - radius, bubbleY);
                ctx.arc(x + width/2 - radius, bubbleY + radius, radius, -Math.PI/2, 0);
                ctx.lineTo(x + width/2, bubbleY + height - radius);
                ctx.arc(x + width/2 - radius, bubbleY + height - radius, radius, 0, Math.PI/2);
                ctx.lineTo(x + triangleWidth, bubbleY + height);
                ctx.lineTo(x, bubbleY + height + triangleHeight);
                ctx.lineTo(x - triangleWidth, bubbleY + height);
                ctx.lineTo(x - width/2 + radius, bubbleY + height);
                ctx.arc(x - width/2 + radius, bubbleY + height - radius, radius, Math.PI/2, Math.PI);
                ctx.lineTo(x - width/2, bubbleY + radius);
                ctx.arc(x - width/2 + radius, bubbleY + radius, radius, Math.PI, -Math.PI/2);

                ctx.closePath();

                // Fill and stroke
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.strokeStyle = '#793C91';
                ctx.lineWidth = screenWidth <= 480 ? 1 : 1.5;
                ctx.stroke();

                // Add shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 1;

                // Add text
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#793C91';
                ctx.font = `${fontSize}px 'Euclid Circular A', Arial, sans-serif`;
                
                const textY = bubbleY + height/2 + 1;
                ctx.fillText(value + '%', x, textY);

                ctx.restore();
            });
            
            ctx.restore();
        }
    };

    // Register plugins globally
    Chart.register(axisArrowPlugin);
    Chart.register(extendedGridLinesPlugin);
    Chart.register(gapPlugin);
    Chart.register(xAxisLabelsPlugin);
    Chart.register(speechBubblePlugin);

    // Make hover state variables global
    window.isLineClicked = isLineClicked;
    window.isLineHovered = isLineHovered;
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Detect if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 767;
    
    const canvas = document.getElementById('efficiencyChart2');
    if (!canvas) {
        console.error('Canvas element with id "efficiencyChart2" not found');
        const debugDiv = document.getElementById('chart-debug2');
        if (debugDiv) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = 'Error: Canvas element not found';
        }
        return;
    }
    console.log('Canvas element found');
    
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



// Generate wave chart data based on the image
const generateWaveData = () => {
    // Data points from the image (including December)
    const percentageValues = [20.2, 10.1, 30.8, 40.1, 60.3, 50.99, 40.7, 30.7, 40.65, 20.1, 5.4, 15.5];
    
    // Create labels for 12 points (full year)
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataPoints = percentageValues;

    return {
        labels,
        dataPoints
    };
};

const waveData = generateWaveData();

const data = {
    labels: waveData.labels,
    datasets: [
        {
            label: 'Wave Chart',
            data: waveData.dataPoints,
            borderColor: '#793C91',
            borderWidth: 2,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                gradient.addColorStop(0, 'rgba(147, 88, 161, 1)');      // 100% opacity at top
                gradient.addColorStop(0.3, 'rgba(147, 88, 161, 0.5)');  // 50% opacity
                gradient.addColorStop(0.6, 'rgba(147, 88, 161, 0.2)');  // 20% opacity
                gradient.addColorStop(1, 'rgba(147, 88, 161, 0)');      // 0% opacity at bottom
                return gradient;
            },
            tension: 0.4, // Smooth curve
            pointRadius: 5,
            pointBackgroundColor: '#793C91',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            pointHitRadius: 10,
            hoverBorderWidth: 3,
            datalabels: {
                display: false
            }
        }
    ]
};

// Function to get responsive settings based on screen size
function getResponsiveSettings() {
    const width = window.innerWidth;

    if (width <= 480) {
        // Small mobile
        return {
            fontSize: 8,
            padding: { top: 100, right: 10, bottom: 60, left: 50 },
            tickPadding: 8,
            stepSize: 10,
            maxRotation: 0
        };
    } else if (width <= 767) {
        // Large mobile
        return {
            fontSize: 9,
            padding: { top: 100, right: 20, bottom: 65, left: 55 },
            tickPadding: 10,
            stepSize: 10,
            maxRotation: 0
        };
    } else if (width <= 1024) {
        // Tablet
        return {
            fontSize: 10,
            padding: { top: 80, right: 50, bottom: 70, left: 60 },
            tickPadding: 12,
            stepSize: 10,
            maxRotation: 0
        };
    } else {
        // Desktop
        return {
            fontSize: 11,
            padding: { top: 80, right: 190, bottom: 75, left: 65 },
            tickPadding: 12,
            stepSize: 10,
            maxRotation: 0
        };
    }
}

const responsiveSettings = getResponsiveSettings();

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        // Force higher DPR on desktop for crisp rendering
        devicePixelRatio: window.innerWidth > 767 ? Math.max(window.devicePixelRatio || 1, 2) : (window.devicePixelRatio || 1),
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        resizeDelay: 100,
        font: {
            family: "'Euclid Circular A', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            lineHeight: 1.2
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            datalabels: {
                display: false // Disable default labels as we use speech bubbles
            },
            tooltip: {
                enabled: false // Disable default tooltip
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 70,
                position: 'left',
                grid: {
                    display: false, // Disable default grid lines, we use custom plugin
                    drawBorder: false,
                    drawTicks: false
                },
                ticks: {
                    display: true,
                    color: '#666',
                    font: {
                        size: responsiveSettings.fontSize || 11,
                        family: "'Euclid Circular A', Arial, sans-serif"
                    },
                    padding: responsiveSettings.tickPadding || 12,
                    stepSize: responsiveSettings.stepSize || 10,
                    callback: function(value) {
                        return value;
                    },
                    crossAlign: 'far',
                    mirror: false
                },
                border: {
                    display: false
                }
            },
            x: {
                offset: true, // Add offset for proper spacing
                grid: {
                    display: false,
                    drawBorder: false,
                    drawTicks: false
                },
                ticks: {
                    display: false // We use custom labels
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

// Initialize the chart
let chart;
console.log('Initializing wave chart...');
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
        const debugDiv = document.getElementById('chart-debug2');
        if (debugDiv) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = 'Error: ' + error.message;
        }
        canvas.style.visibility = 'visible';
        return;
    }

    // Add hover event handlers for speech bubbles
    canvas.addEventListener('mousemove', function(event) {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const hoveredElements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, false);
        
        const meta = chart.getDatasetMeta(0);
        let lineHovered = false;
        
        // Check if hovering over line points with 10px radius
        lineHovered = hoveredElements.some(element => {
            const point = meta.data[element.index];
            const distance = Math.sqrt(
                Math.pow(canvasPosition.x - point.x, 2) +
                Math.pow(canvasPosition.y - point.y, 2)
            );
            return distance <= 10;
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
        
        if (lineHovered !== window.isLineHovered) {
            window.isLineHovered = lineHovered;
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
        window.isLineHovered = false;
        chart.update('none');
    });

    // Add click event handler
    canvas.addEventListener('click', function(event) {
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const clickedElements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, false);
        
        const meta = chart.getDatasetMeta(0);
        let lineClicked = false;
        
        // Check if a line point was clicked with 10px radius
        clickedElements.some(element => {
            const point = meta.data[element.index];
            const distance = Math.sqrt(
                Math.pow(canvasPosition.x - point.x, 2) +
                Math.pow(canvasPosition.y - point.y, 2)
            );
            if (distance <= 10) {
                lineClicked = true;
                return true;
            }
            return false;
        });
        
        // If not clicking a point, check if clicking near the line segments
        if (!lineClicked && meta.data.length > 1) {
            for (let i = 0; i < meta.data.length - 1; i++) {
                const point1 = meta.data[i];
                const point2 = meta.data[i + 1];
                
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
            window.isLineClicked = !window.isLineClicked;
            chart.update('none');
        } else {
            // If clicked elsewhere, hide bubbles
            if (window.isLineClicked) {
                window.isLineClicked = false;
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

            // Update data label font sizes for wave chart
            if (chart.data.datasets[0].datalabels) {
                const dataLabelSize = window.innerWidth <= 480 ? 10 : window.innerWidth <= 767 ? 11 : 12;
                chart.data.datasets[0].datalabels.font.size = dataLabelSize;
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
}); // End of DOMContentLoaded