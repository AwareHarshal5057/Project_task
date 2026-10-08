// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Detect if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 767;

    const canvas = document.getElementById('lineChart');
    if (!canvas) {
        console.error('Canvas element with id "lineChart" not found');
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
        const screenWidth = window.innerWidth;
        let dpr = window.devicePixelRatio || 1;

        // Force higher DPR on desktop for sharper rendering
        if (screenWidth > 767) {
            dpr = Math.max(dpr, 2);
        }

        const height = containerRect.height || 500;

        // For mobile, use responsive width calculation
        let canvasWidth;

        if (screenWidth <= 480) {
            canvasWidth = Math.max(screenWidth * 2.5, 600);
        } else if (screenWidth <= 767) {
            canvasWidth = Math.max(screenWidth * 1.8, 700);
        } else {
            canvasWidth = Math.max(containerRect.width, 800);
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
        beforeDraw: function (chart) {
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
                ctx.moveTo(chartArea.left - 8, y);
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
            const labels = chart.data.labels;

            if (labels && labels.length > 0) {
                labels.forEach((label, index) => {
                    const x = xScale.getPixelForValue(index);

                    // Draw the extended part (bold and black)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, chartArea.bottom);
                    ctx.lineTo(x, chartArea.bottom + 8);
                    ctx.stroke();

                    // Draw the regular part (light gray)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, chartArea.top);
                    ctx.lineTo(x, chartArea.bottom);
                    ctx.stroke();
                });
            }

            ctx.restore();
        }
    };

    // Plugin to draw axis arrows and labels
    const axisArrowPlugin = {
        id: 'axisArrow',
        afterDraw: function (chart) {
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

            // Draw Achievement % label aligned with Y-axis scale labels
            ctx.save();
            const achievementText = 'Achievement %';
            const screenWidth = window.innerWidth;
            let achievementFontSize = chart.options.scales.y.ticks.font.size;

            // Get Y-axis label position to align with scale labels
            const yAxisLabelX = chartArea.left - chart.options.scales.y.ticks.padding - 0;
            const achievementY = chartArea.top - 40;

            // Draw background pill for Achievement % label
            ctx.font = `${achievementFontSize}px 'Euclid Circular A', Arial, sans-serif`;
            const achievementMetrics = ctx.measureText(achievementText);
            const achievementPadding = 8;
            const achievementBoxWidth = achievementMetrics.width + achievementPadding * 2;
            const achievementBoxHeight = achievementFontSize + 6;

            // Draw pill background
            ctx.fillStyle = '#f5f5f5';
            ctx.beginPath();
            const radius = achievementBoxHeight / 2;
            ctx.roundRect(yAxisLabelX - achievementBoxWidth / 2, achievementY - achievementBoxHeight / 2, achievementBoxWidth, achievementBoxHeight, radius);
            ctx.fill();

            // Draw text
            ctx.fillStyle = '#808080';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(achievementText, yAxisLabelX, achievementY);

            // Draw Months 2024-25 label aligned with X-axis scale labels
            const monthsText = 'Months 2024-25';
            let monthsFontSize = chart.options.scales.y.ticks.font.size;

            // Get X-axis label position
            // const monthsX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            // const xAxisLabelY = chartArea.bottom + 50;
            const monthsX = chartArea.right + 100
            const xAxisLabelY = chartArea.bottom;

            // Draw background pill for Months label
            ctx.font = `${monthsFontSize}px 'Euclid Circular A', Arial, sans-serif`;
            const monthsMetrics = ctx.measureText(monthsText);
            const monthsPadding = 12;
            const monthsBoxWidth = monthsMetrics.width + monthsPadding * 2;
            const monthsBoxHeight = monthsFontSize + 6;

            // Draw pill background
            ctx.fillStyle = '#f5f5f5';
            ctx.beginPath();
            const monthsRadius = monthsBoxHeight / 2;
            ctx.roundRect(monthsX - monthsBoxWidth / 2, xAxisLabelY - monthsBoxHeight / 2, monthsBoxWidth, monthsBoxHeight, monthsRadius);
            ctx.fill();

            // Draw text
            ctx.fillStyle = '#808080';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(monthsText, monthsX, xAxisLabelY);

            ctx.restore();
        }
    };

    // Register custom plugins
    Chart.register(extendedGridLinesPlugin);
    Chart.register(axisArrowPlugin);

    // Generate realistic demo data for multiple team members
    const generateLineData = () => {
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

        // Team members with their colors (matching the legend) - all unique colors
        const teamMembers = [
            { name: 'Aditi Singh', color: '#4A90E2' },
            { name: 'Saumya Nanda', color: '#7B68EE' },
            { name: 'Prakhar Aggarwal', color: '#50E3C2' },
            { name: 'Shreya Kumari', color: '#BD10E0' },
            { name: 'Ananya Gupta', color: '#FF6B6B' },
            { name: 'Aarya Singh', color: '#4ECDC4' },
            { name: 'Akanksha Gupta', color: '#45B7D1' },
            { name: 'Raj Nandini', color: '#96CEB4' },
            { name: 'Rishav Poddar', color: '#F5A623' },
            { name: 'Sunil Verma', color: '#DDA0DD' },
            { name: 'Kajal Kumari', color: '#E94B3C' }
        ];

        // Generate data that matches the image patterns
        const datasets = teamMembers.map((member, index) => {
            let data;

            // Create different patterns for each team member based on the image
            switch (index) {
                case 0: // Aditi Singh (blue line - highest performer)
                    data = [300, 350, 280, 320, 180, 150, 120, 100, 80, 50, 30, 20, 10];
                    // data = [300, 350, 280, "","","",""];
                    break;
                case 1: // Saumya Nanda (gray line)
                    data = [200, 220, 180, 200, 160, 140, 120, 100, 90, 80, 70, 60, 50];
                    break;
                case 2: // Prakhar Aggarwal (cyan line)
                    data = [250, 280, 240, 260, 200, 180, 160, 140, 120, 100, 80, 70, 60];
                    break;
                case 3: // Shreya Kumari (purple line)
                    data = [400, 450, 420, 480, 460, 440, 420, 400, 380, 360, 340, 320, 300];
                    break;
                case 4: // Ananya Gupta (gray line)
                    data = [150, 170, 140, 160, 130, 120, 110, 100, 90, 80, 70, 60, 50];
                    break;
                case 5: // Aarya Singh (gray line)
                    data = [180, 200, 170, 190, 150, 140, 130, 120, 110, 100, 90, 80, 70];
                    break;
                case 6: // Akanksha Gupta (gray line)
                    data = [120, 140, 110, 130, 100, 90, 80, 70, 60, 50, 40, 30, 20];
                    break;
                case 7: // Raj Nandini (gray line)
                    data = [100, 120, 90, 110, 80, 70, 60, 50, 40, 30, 20, 15, 10];
                    break;
                case 8: // Rishav Poddar (yellow line - top performer)
                    data = [600, 680, 620, 900, 650, 600, 580, 560, 540, 520, 500, 480, 460];
                    break;
                case 9: // Sunil Verma (gray line)
                    data = [80, 100, 70, 90, 60, 50, 40, 30, 25, 20, 15, 10, 5];
                    break;
                case 10: // Kajal Kumari (red line)
                    data = [220, 240, 200, 220, 180, 160, 140, 120, 100, 80, 60, 40, 20];
                    break;
                default:
                    data = Array(13).fill(0).map(() => Math.random() * 200 + 50);
            }

            return {
                label: member.name,
                data: data,
                borderColor: member.color,
                backgroundColor: member.color,
                borderWidth: 1.5, // Thin lines as requested
                fill: false,
                tension: 0.4, // Smooth curves
                pointRadius: 0, // No points visible by default
                pointHoverRadius: 4,
                pointBackgroundColor: member.color,
                pointBorderColor: 'white',
                pointBorderWidth: 1,
                originalColor: member.color, // Store original color for toggle
                datalabels: {
                    display: false
                }
            };
        });

        return {
            months,
            datasets
        };
    };

    const lineData = generateLineData();

    const data = {
        labels: lineData.months,
        datasets: lineData.datasets
    };

    // Function to get responsive settings based on screen size
    function getResponsiveSettings() {
        const width = window.innerWidth;

        if (width <= 480) {
            return {
                fontSize: 8,
                padding: { top: 80, right: 10, bottom: 60, left: 15 },
                tickPadding: 8,
                stepSize: 100,
                maxRotation: 0
            };
        } else if (width <= 767) {
            return {
                fontSize: 9,
                padding: { top: 80, right: 20, bottom: 65, left: 25 },
                tickPadding: 10,
                stepSize: 100,
                maxRotation: 0
            };
        } else if (width <= 1024) {
            return {
                fontSize: 10,
                padding: { top: 80, right: 50, bottom: 70, left: 55 },
                tickPadding: 12,
                stepSize: 100,
                maxRotation: 0
            };
        } else {
            return {
                fontSize: 11,
                padding: { top: 80, right: 190, bottom: 75, left: 60 },
                tickPadding: 12,
                stepSize: 100,
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
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
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
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    // max: 800, // As shown in the image
                    position: 'left',
                    grid: {
                        display: false,
                        drawBorder: false,
                        drawTicks: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: responsiveSettings.fontSize,
                            family: "'Euclid Circular A', Arial, sans-serif"
                        },
                        padding: responsiveSettings.tickPadding,
                        stepSize: responsiveSettings.stepSize,
                        crossAlign: 'far',
                        mirror: false
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
                    ticks: {
                        color: '#666',
                        font: {
                            size: responsiveSettings.fontSize,
                            family: "'Euclid Circular A', Arial, sans-serif"
                        },
                        padding: responsiveSettings.tickPadding,
                        maxRotation: responsiveSettings.maxRotation
                    },
                    border: {
                        display: false
                    },
                    offset: true,
                    afterFit: function (scale) {
                        scale.paddingLeft = 20; // Add 20px gap on the left
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
    try {
        // Add visibility lock to prevent blinking
        canvas.style.visibility = 'hidden';

        // Ensure crisp rendering for Chart.js
        Chart.defaults.font.family = "'Euclid Circular A', Arial, sans-serif";
        Chart.defaults.responsive = true;
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
            chart.ctx.lineJoin = 'round';
            chart.ctx.lineCap = 'round';
        }

        // Make visible after chart is ready
        requestAnimationFrame(() => {
            canvas.style.visibility = 'visible';
            chart.update('none');
        });

        console.log('Line chart initialized successfully');
    } catch (error) {
        console.error('Error initializing chart:', error);
        canvas.style.visibility = 'visible';
        return;
    }

    // Handle window resize for better responsiveness
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    window.addEventListener('resize', function () {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;

        if (Math.abs(currentWidth - lastWidth) < 10 && Math.abs(currentHeight - lastHeight) < 10) {
            return;
        }

        lastWidth = currentWidth;
        lastHeight = currentHeight;

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            const newSettings = getResponsiveSettings();

            chart.options.scales.y.ticks.font.size = newSettings.fontSize;
            chart.options.scales.y.ticks.padding = newSettings.tickPadding;
            chart.options.scales.y.ticks.stepSize = newSettings.stepSize;
            chart.options.scales.x.ticks.font.size = newSettings.fontSize;
            chart.options.scales.x.ticks.padding = newSettings.tickPadding;
            chart.options.scales.x.ticks.maxRotation = newSettings.maxRotation;
            chart.options.layout.padding = newSettings.padding;

            if (chart.ctx) {
                chart.ctx.imageSmoothingEnabled = true;
                chart.ctx.imageSmoothingQuality = 'high';
                chart.ctx.lineJoin = 'round';
                chart.ctx.lineCap = 'round';
            }

            chart.resize();
            chart.update('none');
        }, 250);
    });

    // Disable right-click context menu on chart
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Prevent resize during scroll on mobile
    let scrollTimeout;
    let isScrolling = false;
    let lastScrollY = window.scrollY;

    const scrollHandler = function () {
        const currentScrollY = window.scrollY;

        if (Math.abs(currentScrollY - lastScrollY) > 5) {
            isScrolling = true;
            lastScrollY = currentScrollY;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                isScrolling = false;
            }, 300);
        }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('touchmove', scrollHandler, { passive: true });

    // Prevent chart updates during scroll on mobile
    if (isMobile) {
        const originalUpdate = chart.update;
        chart.update = function (mode) {
            if (!isScrolling) {
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

    // Interactive legend functionality with toggle switches
    const legendItems = document.querySelectorAll('.interactive-legend');

    // Initialize toggle switches with correct colors and active state
    legendItems.forEach((legendItem, index) => {
        const toggleSwitch = legendItem.querySelector('.toggle-switch');
        const datasetIndex = parseInt(legendItem.getAttribute('data-dataset'));
        const dataset = chart.data.datasets[datasetIndex];

        if (toggleSwitch && dataset) {
            // // Set the toggle color from data attribute
            const color = toggleSwitch.getAttribute('data-color');
            toggleSwitch.style.setProperty('--toggle-color', color);

            // // Set initial active state (all datasets visible by default)
            // toggleSwitch.classList.add('active');


            // Set initial state as disabled (grey line and inactive toggle)
            dataset.originalColor = dataset.borderColor; // backup original color
            dataset.borderColor = '#ccc';
            dataset.backgroundColor = '#ccc';
            dataset.pointBackgroundColor = '#ccc';

            toggleSwitch.classList.remove('active'); // not active
            legendItem.classList.add('disabled');    // visually mark as disabled
        }
    });

    legendItems.forEach(legendItem => {
        legendItem.addEventListener('click', function () {
            const datasetIndex = parseInt(this.getAttribute('data-dataset'));
            const dataset = chart.data.datasets[datasetIndex];
            const toggleSwitch = this.querySelector('.toggle-switch');

            if (dataset && toggleSwitch) {
                // Toggle between colored and grey
                const isActive = toggleSwitch.classList.contains('active');

                if (isActive) {
                    // Make line grey (disabled state)
                    dataset.borderColor = '#ccc';
                    dataset.backgroundColor = '#ccc';
                    dataset.pointBackgroundColor = '#ccc';
                    toggleSwitch.classList.remove('active');
                    this.classList.add('disabled');
                } else {
                    // Restore original color (active state)
                    dataset.borderColor = dataset.originalColor;
                    dataset.backgroundColor = dataset.originalColor;
                    dataset.pointBackgroundColor = dataset.originalColor;
                    toggleSwitch.classList.add('active');
                    this.classList.remove('disabled');
                }

                // Update chart
                chart.update('none');
            }
        });

        // Hover effects removed - lines stay thin always
    });

    // Custom tooltip functionality
    let tooltipEl = null;

    function createTooltip() {
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'line-chart-tooltip';
            tooltipEl.style.opacity = '0';
            document.body.appendChild(tooltipEl);
        }
        return tooltipEl;
    }

    function showTooltip(event, datasetIndex, pointIndex) {
        const tooltip = createTooltip();
        const dataset = chart.data.datasets[datasetIndex];
        const teamMemberName = dataset.label;
        const teamMemberColor = dataset.originalColor || dataset.borderColor;

        // Create tooltip content
        let innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-color-indicator" style="background-color: ${teamMemberColor}"></div>
                <span>${teamMemberName}</span>
            </div>
        `;

        // Add all monthly data for this team member
        const monthNames = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 24', 'Apr 24', 'May 24', 'Jun 25', 'Jul 25', 'Aug 24', 'Sep 24', 'Oct 24'];
        dataset.data.forEach((value, index) => {
            const percentage = ((value / 800) * 100).toFixed(2); // Convert to percentage based on max scale
            innerHTML += `
                <div class="tooltip-data-row">
                    <span class="tooltip-month">${monthNames[index]}</span>
                    <span class="tooltip-value">${percentage}%</span>
                </div>
            `;
        });

        tooltip.innerHTML = innerHTML;

        // Get the actual data point position for precise tooltip placement
        const canvasRect = canvas.getBoundingClientRect();
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;

        // Get the pixel position of the data point
        const dataPointX = xScale.getPixelForValue(pointIndex);
        const dataPointY = yScale.getPixelForValue(dataset.data[pointIndex]);

        // Convert chart coordinates to screen coordinates
        const screenX = canvasRect.left + dataPointX;
        const screenY = canvasRect.top + dataPointY;

        // Position tooltip to the right of the data point, vertically centered
        tooltip.style.opacity = '1';
        tooltip.style.left = (screenX + 15) + 'px';

        // Center tooltip vertically around the data point
        // We need to wait for the tooltip to render to get its height
        requestAnimationFrame(() => {
            const tooltipHeight = tooltip.offsetHeight;
            tooltip.style.top = (screenY - tooltipHeight / 2) + 'px';
        });
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.style.opacity = '0';
        }
    }

    // Add hover event listeners to canvas
    canvas.addEventListener('mousemove', function (event) {
        // Use intersect: true for precise line detection - only show tooltip when directly over line points
        const points = chart.getElementsAtEventForMode(event, 'point', { intersect: true }, false);

        if (points.length > 0) {
            // Find the closest line dataset
            const linePoints = points.filter(point => {
                const dataset = chart.data.datasets[point.datasetIndex];
                return dataset.type === 'line' || !dataset.type; // line is default type
            });

            if (linePoints.length > 0) {
                const point = linePoints[0];
                // Check if this dataset is visible (not greyed out)
                const dataset = chart.data.datasets[point.datasetIndex];
                if (dataset.borderColor === '#ccc') {
                    hideTooltip();
                    canvas.style.cursor = 'default';
                    return;
                }

                showTooltip(event, point.datasetIndex, point.index);
                canvas.style.cursor = 'pointer';
            } else {
                hideTooltip();
                canvas.style.cursor = 'default';
            }
        } else {
            hideTooltip();
            canvas.style.cursor = 'default';
        }
    });


    canvas.addEventListener('mouseleave', function () {
        hideTooltip();
        canvas.style.cursor = 'default';
    });
});