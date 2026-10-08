// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the container element
    const container = document.getElementById('heatmapChart');
    if (!container) {
        console.error('Element with id "heatmapChart" not found');
        return;
    }
    
    // Define the data
    const months = [
        'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
        'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25'
    ];
    
    // Create days array (1-31)
    const days = Array.from({length: 31}, (_, i) => i + 1);
    
    // Color mapping based on requirements
    const colorMap = {
        0: '#C0C0C0',  // Gray (No Data)
        1: '#38AF4A',  // Green (<100%)
        2: '#FFBF00',  // Yellow (>=110%)
        3: '#ED3024'   // Red (Between 100% to 110%)
    };
    
    // Status text mapping
    const statusMap = {
        0: 'No Data',
        1: 'Underperformance (<100%)',
        2: 'Overperformance (≥110%)',
        3: 'Marginal Overperformance (100-110%)'
    };
    
    // Generate realistic heatmap data
    function generateHeatmapData() {
        const data = {};
        
        // Initialize all cells to 0 (No Data)
        months.forEach(month => {
            data[month] = {};
            days.forEach(day => {
                data[month][day] = 0;
            });
        });
        
        // Generate realistic data for each month
        months.forEach(month => {
            const daysInMonth = getDaysInMonth(month);
            for (let day = 1; day <= daysInMonth; day++) {
                // Random distribution of performance states
                const rand = Math.random();
                if (rand < 0.15) {
                    data[month][day] = 0; // 15% No Data
                } else if (rand < 0.45) {
                    data[month][day] = 1; // 30% Underperformance
                } else if (rand < 0.75) {
                    data[month][day] = 2; // 30% Overperformance
                } else {
                    data[month][day] = 3; // 25% Marginal Overperformance
                }
            }
        });
        
        return data;
    }
    
    // Get number of days in a month
    function getDaysInMonth(monthStr) {
        const [monthName, yearStr] = monthStr.split(' ');
        const year = parseInt('20' + yearStr);
        const monthIndex = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        }[monthName];
        
        return new Date(year, monthIndex + 1, 0).getDate();
    }
    
    // Format date for tooltip
    function formatDate(monthStr, day) {
        const [monthName, yearStr] = monthStr.split(' ');
        const year = parseInt('20' + yearStr);
        const monthIndex = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        }[monthName];
        
        const date = new Date(year, monthIndex, day);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Create the heatmap
    function createHeatmap() {
        const data = generateHeatmapData();
        console.log("Datas:-",data)
        
        // Clear the container
        container.innerHTML = '';
        
        // Create main layout container
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.gap = '20px';
        mainContainer.style.fontFamily = "'Euclid Circular A', Arial, sans-serif";
        
        // Create the heatmap wrapper with scroll container
        const heatmapWrapper = document.createElement('div');
        heatmapWrapper.className = 'chart-wrapper';
        heatmapWrapper.style.height = 'auto';
        heatmapWrapper.style.padding = '10px 0';

        
        // Create the heatmap scroll container
        const heatmapScrollContainer = document.createElement('div');
        heatmapScrollContainer.className = 'chart-scroll-container';
        heatmapScrollContainer.style.minWidth = '800px';
        heatmapScrollContainer.style.height = 'auto';
        
        // Create the heatmap grid
        const heatmapGrid = document.createElement('div');
        heatmapGrid.style.width = '100%';
        heatmapGrid.style.margin = '0 auto';
        
        
        // Create scale with numbers BELOW the line
        const scaleWrapper = document.createElement('div');
        scaleWrapper.style.position = 'relative';
        scaleWrapper.style.marginBottom = '10px';
        
        
        // Create scale line that spans all days
        const scaleLine = document.createElement('div');
        scaleLine.style.position = 'absolute';
        scaleLine.style.top = '0';
        scaleLine.style.left = '70px';
        scaleLine.style.height = '1px';
        scaleLine.style.backgroundColor = '#ccc';
        scaleLine.style.width = 'calc(100% - 70px)';
        scaleWrapper.appendChild(scaleLine);
        
        // Create scale container for numbers
        const scaleContainer = document.createElement('div');
        scaleContainer.style.display = 'flex';
        scaleContainer.style.marginLeft = '70px';
        scaleContainer.style.height = '25px';
        scaleContainer.style.alignItems = 'flex-end';
        scaleContainer.style.width = 'calc(100% - 70px)';
        
        // Add tick marks and numbers for each dayback
        days.forEach((day, index) => {
            const tickContainer = document.createElement('div');
            tickContainer.style.flex = '1';
            tickContainer.style.height = '25px';
            tickContainer.style.position = 'relative';
            tickContainer.style.display = 'flex';
            tickContainer.style.flexDirection = 'column';
            tickContainer.style.alignItems = 'center';
            tickContainer.style.justifyContent = 'flex-end';
            
            // Add tick mark extending down from line
            const tick = document.createElement('div');
            tick.style.width = '1px';
            tick.style.height = '5px';
            tick.style.backgroundColor = '#999';
            tick.style.position = 'absolute';
            tick.style.top = '0';
            tickContainer.appendChild(tick);

            
            // Add number below the line - centered with the boxes
            const dayLabel = document.createElement('div');
            dayLabel.textContent = day.toString().padStart(2, '0');
            dayLabel.style.fontSize = '11px';
            dayLabel.style.color = '#666';
            dayLabel.style.marginTop = '8px';
            dayLabel.style.textAlign = 'center';
            dayLabel.style.width = '100%';
            dayLabel.style.position = 'absolute';
            dayLabel.style.left = '50%';
            dayLabel.style.transform = 'translateX(-50%)';
            dayLabel.style.bottom = '0';
            tickContainer.appendChild(dayLabel);
            
            scaleContainer.appendChild(tickContainer);
        });
        
        scaleWrapper.appendChild(scaleContainer);
        
        heatmapGrid.appendChild(scaleWrapper);
        
        // Create rows for each month
        // months.forEach(month => {
        //     const row = document.createElement('div');
        //     row.style.display = 'flex';
        //     row.style.marginBottom = '2px';
        //     row.style.alignItems = 'center';
            
        //     // Add month label
        //     const monthLabel = document.createElement('div');
        //     monthLabel.textContent = month;
        //     monthLabel.style.width = '70px';
        //     monthLabel.style.fontSize = '11px';
        //     monthLabel.style.color = '#495057';
        //     monthLabel.style.textAlign = 'center';
        //     monthLabel.style.paddingRight = '0';
        //     monthLabel.style.fontWeight = '400';
        //     monthLabel.style.display = 'flex';
        //     monthLabel.style.alignItems = 'center';
        //     monthLabel.style.justifyContent = 'center';
        //     monthLabel.style.flexShrink = '0';
        //     row.appendChild(monthLabel);
            
        //     // Create cells container
        //     const cellsContainer = document.createElement('div');
        //     cellsContainer.style.display = 'flex';
        //     cellsContainer.style.flex = '1';
        //     cellsContainer.style.gap = '1px';
            
        //     // Add cells for each day
        //     const daysInMonth = getDaysInMonth(month);
        //     days.forEach(day => {
        //         const cell = document.createElement('div');
        //         cell.style.flex = '1';
        //         cell.style.aspectRatio = '1';
        //         cell.style.borderRadius = '2px';
        //         cell.style.border = '1px solid #fff';
        //         cell.style.boxSizing = 'border-box';
                
                
        //         if (day <= daysInMonth) {
        //             const value = data[month][day];
        //             console.log(value)
        //             cell.style.backgroundColor = colorMap[value];
        //         } else {
        //             // Days beyond month's end show as "No Data"
        //             cell.style.backgroundColor = colorMap[0]; // Gray (No Data)
        //             cell.style.border = '1px solid #fff';
        //         }
                
        //         cellsContainer.appendChild(cell);
        //     });
            
        //     row.appendChild(cellsContainer);
        //     heatmapGrid.appendChild(row);
        // });

    months.forEach((month, monthIndex) => { 
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.marginBottom = '2px';
    row.style.alignItems = 'center';
    
    // Add month label
    const monthLabel = document.createElement('div');
    monthLabel.textContent = month;
    monthLabel.style.width = '70px';
    monthLabel.style.fontSize = '11px';
    monthLabel.style.color = '#495057';
    monthLabel.style.textAlign = 'center';
    monthLabel.style.paddingRight = '0';
    monthLabel.style.fontWeight = '400';
    monthLabel.style.display = 'flex';
    monthLabel.style.alignItems = 'center';
    monthLabel.style.justifyContent = 'center';
    monthLabel.style.flexShrink = '0';
    row.appendChild(monthLabel);
    
    // Create cells container
    const cellsContainer = document.createElement('div');
    cellsContainer.style.display = 'flex';
    cellsContainer.style.flex = '1';
    cellsContainer.style.gap = '1px';
    
    const daysInMonth = getDaysInMonth(month);

    days.forEach((day, dayIndex) => { // <-- Added dayIndex to identify first/last column
        const cell = document.createElement('div');
        cell.style.flex = '1';
        cell.style.aspectRatio = '1';
        cell.style.borderRadius = '0'; // default, overridden below if corner
        cell.style.border = '1px solid #fff';
        cell.style.boxSizing = 'border-box';

        if (day <= daysInMonth) {
            const value = data[month][day];
            console.log(value)
            cell.style.backgroundColor = colorMap[value];
        } else {
            cell.style.backgroundColor = colorMap[0];
            cell.style.border = '1px solid #fff';
        }

        // --- Begin: Corner rounding logic ---
        const isFirstRow = monthIndex === 0;
        const isLastRow = monthIndex === months.length - 1;
        const isFirstCol = dayIndex === 0;
        const isLastCol = dayIndex === days.length - 1;

        if (isFirstRow && isFirstCol) {
            cell.style.borderTopLeftRadius = '10px'; // Top-left corner
        }
        if (isFirstRow && isLastCol) {
            cell.style.borderTopRightRadius = '10px'; // Top-right corner
        }
        if (isLastRow && isFirstCol) {
            cell.style.borderBottomLeftRadius = '10px'; // Bottom-left corner
        }
        if (isLastRow && isLastCol) {
            cell.style.borderBottomRightRadius = '10px'; // Bottom-right corner
        }

        cellsContainer.appendChild(cell);
    });

    row.appendChild(cellsContainer);
    heatmapGrid.appendChild(row);
});

        
        
        heatmapScrollContainer.appendChild(heatmapGrid);
        heatmapWrapper.appendChild(heatmapScrollContainer);
        mainContainer.appendChild(heatmapWrapper);
        
        // Add legend
        const legend = createLegend();
        mainContainer.appendChild(legend);
        
        // Create monthly summary container and add it below
        const monthlySummary = createMonthlySummary(data);
        mainContainer.appendChild(monthlySummary);
        
        container.appendChild(mainContainer);
    }
    
    // Create the legend
    function createLegend() {
        const legend = document.createElement('div');
        legend.style.display = 'flex';
        legend.style.justifyContent = 'flex-start';
        legend.style.marginTop = '20px';
        legend.style.marginBottom = '20px';
        legend.style.gap = '30px';
        legend.style.flexWrap = 'wrap';
        legend.style.alignItems = 'center';
        // legend.style.paddingLeft = '70px';
        
        const items = [
            { color: '#FFBF00', text: '>=110%' },
            { color: '#38AF4A', text: '<100%' },
            { color: '#ED3024', text: 'Between 100% to 110%' },
            { color: '#C0C0C0', text: 'No Data' }
        ];
        
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '6px';
            
            const colorDot = document.createElement('div');
            colorDot.style.width = '16px';
            colorDot.style.height = '16px';
            colorDot.style.backgroundColor = item.color;
            colorDot.style.borderRadius = '50%';
            colorDot.style.border = '3px solid white';
            colorDot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            
            const text = document.createElement('span');
            text.textContent = item.text;
            text.style.fontSize = '16px';
            text.style.color = '#666';
            text.style.fontWeight = '400';
            
            itemDiv.appendChild(colorDot);
            itemDiv.appendChild(text);
            legend.appendChild(itemDiv);
        });
        
        return legend;
    }
    
    // Create monthly summary
    function createMonthlySummary(data) {
        const summaryBox = document.createElement('div');
        summaryBox.style.fontFamily = "'Euclid Circular A', Arial, sans-serif";
        summaryBox.style.marginTop = '20px';
        
        // Create container for two tables side by side
        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'monthly-summary-tables';
        tablesContainer.style.display = 'flex';
        tablesContainer.style.gap = '20px';
        tablesContainer.style.flexWrap = 'wrap';
        tablesContainer.style.justifyContent = 'center';
        
        // First table (Dec 24 to Jun 25 - 8 months)
        const firstTableMonths = months.slice(0, 7);
        const firstTable = createSummaryTable(firstTableMonths, data);
        tablesContainer.appendChild(firstTable);
        
        // Second table (Jul 25 to Dec 25 - 7 months including Dec 25)
        const secondTableMonths = months.slice(7, 14);
        const secondTable = createSummaryTable(secondTableMonths, data);
        tablesContainer.appendChild(secondTable);
        
        summaryBox.appendChild(tablesContainer);
        
        return summaryBox;
    }
    
    // Create a summary table for given months
    function createSummaryTable(monthsList, data) {
        const tableWrapper = document.createElement('div');
        tableWrapper.style.flex = '1';
        tableWrapper.style.minWidth = '300px';
        tableWrapper.style.maxWidth = '600px';
        tableWrapper.style.overflowX = 'auto';
        
const table = document.createElement('table');
table.style.width = '100%';
table.style.borderCollapse = 'separate'; // allow border-radius to work
table.style.borderSpacing = '0'; // no extra spacing between cells
table.style.backgroundColor = 'white';
table.style.border = '1px solid #B3B3B3';
table.style.borderRadius = '8px'; // make it more visible
table.style.overflow = 'hidden'; // clip content to rounded edges
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        monthsList.forEach((month, index) => {
            const tr = document.createElement('tr');
            
            // Month cell
            const monthCell = document.createElement('td');
            monthCell.textContent = month;
            monthCell.style.padding = '12px 16px';
            monthCell.style.fontWeight = '500';
            monthCell.style.fontSize = '11px';
            monthCell.style.color = '#495057';
            monthCell.style.border = '1px solid #B3B3B3';
            monthCell.style.width = '100px';
            tr.appendChild(monthCell);
            
            // Calculate statistics
            const stats = calculateMonthStats(data[month], getDaysInMonth(month));
            
            // Data cells with colored dots
            const statItems = [
                { color: '#FFBF00', value: stats.overperformance },
                { color: '#38AF4A', value: stats.underperformance },
                { color: '#ED3024', value: stats.marginal },
                { color: '#C0C0C0', value: stats.noData }
            ];
            
            statItems.forEach((item, statIndex) => {
                const dataCell = document.createElement('td');
                dataCell.style.padding = '12px 16px';
                dataCell.style.fontSize = '11px';
                dataCell.style.color = '#495057';
                dataCell.style.border = '1px solid #B3B3B3';
                
                // Create container for dot and text
                const cellContent = document.createElement('div');
                cellContent.className = 'summary-cell-content';
                cellContent.style.display = 'flex';
                cellContent.style.alignItems = 'center';
                cellContent.style.gap = '8px';
                
                // Create colored dot
                const dot = document.createElement('div');
                dot.className = 'summary-dot';
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = item.color;
                dot.style.flexShrink = '0';
                
                // Create text
                const text = document.createElement('span');
                text.className = 'summary-text';
                text.textContent = `${item.value} days`;
                
                cellContent.appendChild(dot);
                cellContent.appendChild(text);
                dataCell.appendChild(cellContent);
                tr.appendChild(dataCell);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        
        return tableWrapper;
    }
    
    // Calculate monthly statistics
    function calculateMonthStats(monthData, daysInMonth) {
        let overperformance = 0;
        let underperformance = 0;
        let marginal = 0;
        let noData = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const value = monthData[day];
            switch (value) {
                case 0: noData++; break;
                case 1: underperformance++; break;
                case 2: overperformance++; break;
                case 3: marginal++; break;
            }
        }
        
        return { overperformance, underperformance, marginal, noData };
    }
    
    // Initialize the heatmap
    createHeatmap();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        createHeatmap();
    });
});