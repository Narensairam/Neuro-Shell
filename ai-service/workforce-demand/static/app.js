/**
 * Shell EOS – Workforce & Safety Intelligence
 * Dynamic Frontend connecting to Flask Backend
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // Bind Scenario Buttons (Keep these for manual testing if needed)
    document.getElementById("btn-simulate-fire").addEventListener("click", () => fetchScenario("/api/scenario/fire", "POST"));
    document.getElementById("btn-simulate-maintenance").addEventListener("click", () => fetchScenario("/api/scenario/maintenance", "POST"));

    // Start Live Polling Engine
    console.log("Starting Live API Polling...");
    setInterval(pollLiveApi, 3000); // Poll every 3 seconds

    function pollLiveApi() {
        console.log("Polling live fire API...");
        fetch("/api/scenario/live", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Live API Data Polled:", data);
            const banner = document.getElementById("live-banner");
            
            if (data.event === "none") {
                // Show Safe Status
                banner.innerText = "✅ System Normal: No active alerts detected.";
                banner.style.backgroundColor = "var(--color-green-light)";
                banner.style.color = "var(--color-green)";
                banner.style.borderLeft = "4px solid var(--color-green)";
                banner.style.display = "block";
                
                // Clear out the dashboard numbers
                clearDashboard();
            } else if (data.event === "error") {
                banner.innerText = `⚠️ Connection Error: ${data.message}`;
                banner.style.backgroundColor = "var(--bg-main)";
                banner.style.color = "var(--text-secondary)";
                banner.style.borderLeft = "4px solid var(--color-yellow)";
                banner.style.display = "block";
            } else {
                // Active Fire Event
                banner.innerHTML = `🚨 ACTIVE ALERT: Fire detected at ${data.camera_location || 'Unknown'} (Confidence: ${data.api_confidence || 'N/A'}). AI Workforce planning engaged.`;
                banner.style.backgroundColor = "var(--color-red-light)";
                banner.style.color = "var(--color-red)";
                banner.style.borderLeft = "4px solid var(--color-red)";
                banner.style.display = "block";
                
                updateDashboard(data);
                addAlert(data);
            }
        })
        .catch(err => {
            console.error("Error polling live API:", err);
        });
    }

    function fetchScenario(endpoint, method="POST") {
        console.log(`Commanding ${endpoint}...`);
        
        fetch(endpoint, {
            method: method,
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if(data.event !== "none") {
                updateDashboard(data);
                addAlert(data);
            }
        });
    }

    function clearDashboard() {
        document.getElementById("kpi-available").innerText = "40"; // Assuming a default state
        document.getElementById("kpi-demand").innerText = "20";
        document.getElementById("kpi-gap").innerText = "0";
        document.getElementById("kpi-risk").innerText = "LOW";
        document.getElementById("kpi-risk-explanation").innerText = "Standard operations.";

        document.getElementById("bar-available").style.width = `80%`;
        document.getElementById("bar-demand").style.width = `40%`;
        document.getElementById("bar-gap").style.width = `0%`;

        document.getElementById("event-title").innerHTML = `<span class="icon">✅</span> No Active Events`;
        document.getElementById("event-title").className = "panel-header text-green";
        document.getElementById("event-severity").innerText = "N/A";
        document.getElementById("event-severity").className = "value font-bold";
        document.getElementById("event-req").innerText = "-";
        document.getElementById("event-avail").innerText = "-";
        document.getElementById("event-gap").innerText = "-";
        document.getElementById("event-gap").className = "value font-bold";

        document.getElementById("skills-list").innerHTML = '<li><span class="label">All roles:</span> <span class="value badge">Standard Assignment</span></li>';
        
        document.getElementById("ai-recommendation").innerText = `"No action required. Workforce is stable."`;
        
        document.getElementById("contractor-name").innerText = "None";
        document.getElementById("contractor-score").innerText = "N/A";
        document.getElementById("contractor-status").innerText = "Idle";
        document.getElementById("btn-contractor").style.display = "none";
        
        document.getElementById("analytics-risk").innerText = "LOW";
        document.getElementById("analytics-reason").innerHTML = `<strong>Reason:</strong> No hazards detected.`;
        
        const riskBox = document.getElementById("risk-box");
        riskBox.className = "status-box";
        riskBox.style.backgroundColor = "var(--color-green-light)";
        riskBox.style.borderLeftColor = "var(--color-green)";
        
        document.getElementById("kpi-card-gap").className = "kpi-card";
        document.getElementById("kpi-card-risk").className = "kpi-card";

        document.getElementById("ai-confidence").innerText = "100%";
        document.getElementById("ai-explanation").innerText = "System in equilibrium.";
    }

    function updateDashboard(data) {
        // Update KPIs
        document.getElementById("kpi-available").innerText = data.available_workers;
        document.getElementById("kpi-demand").innerText = data.required_workers;
        document.getElementById("kpi-gap").innerText = data.gap;
        document.getElementById("kpi-risk").innerText = data.risk_level;
        document.getElementById("kpi-risk-explanation").innerText = data.explanation;

        // Update Progress Bars dynamically
        const maxWorkers = Math.max(data.available_workers, data.required_workers, 50);
        document.getElementById("bar-available").style.width = `${(data.available_workers / maxWorkers) * 100}%`;
        document.getElementById("bar-demand").style.width = `${(data.required_workers / maxWorkers) * 100}%`;
        document.getElementById("bar-gap").style.width = `${(data.gap / maxWorkers) * 100}%`;

        // Update Event Details
        const icon = data.event.includes("Fire") ? "🔥" : (data.event.includes("Maintenance") || data.event.includes("Failure") ? "⚙️" : "⚠️");
        document.getElementById("event-title").innerHTML = `<span class="icon">${icon}</span> ${data.event} Predicted`;
        document.getElementById("event-title").className = data.severity === "HIGH" ? "panel-header text-red" : "panel-header";
        
        document.getElementById("event-severity").innerText = data.severity;
        document.getElementById("event-severity").className = data.severity === "HIGH" ? "value text-red font-bold" : "value font-bold";
        
        document.getElementById("event-req").innerText = data.required_workers;
        document.getElementById("event-avail").innerText = data.available_workers;
        document.getElementById("event-gap").innerText = data.gap;
        document.getElementById("event-gap").className = data.gap > 0 ? "value text-red" : "value font-bold";

        // Update Skills List dynamically
        const skillsList = document.getElementById("skills-list");
        skillsList.innerHTML = "";
        for (const [skill, count] of Object.entries(data.skills_required)) {
            if (count > 0) {
                const li = document.createElement("li");
                li.innerHTML = `<span class="label">${skill}:</span> <span class="value badge">${count}</span>`;
                skillsList.appendChild(li);
            }
        }

        // AI Recommendation
        document.getElementById("ai-recommendation").innerText = `"${data.recommendation}"`;
        
        // Reset Deploy Button
        const btnDeploy = document.getElementById("btn-deploy");
        btnDeploy.textContent = "Execute Recommendation";
        btnDeploy.style.backgroundColor = "var(--color-blue)";

        // Contractor Info
        document.getElementById("contractor-name").innerText = data.contractor;
        if (data.contractor_details) {
            document.getElementById("contractor-score").innerText = data.contractor_details.score;
            document.getElementById("contractor-status").innerText = data.contractor_details.status;
            document.getElementById("btn-contractor").innerText = `Contact ${data.contractor}`;
            document.getElementById("btn-contractor").style.display = "block";
            // Reset contact button
            const btnContractor = document.getElementById("btn-contractor");
            btnContractor.className = "btn-secondary mt-sm";
            btnContractor.style.backgroundColor = "white";
        } else {
            document.getElementById("contractor-score").innerText = "N/A";
            document.getElementById("contractor-status").innerText = "None Required";
            document.getElementById("btn-contractor").style.display = "none";
        }

        // Safety Analytics Dashboard
        document.getElementById("analytics-risk").innerText = data.risk_level;
        document.getElementById("analytics-reason").innerHTML = `<strong>Reason:</strong> ${data.explanation}`;
        const riskBox = document.getElementById("risk-box");
        if (data.risk_level === "HIGH") {
            riskBox.className = "status-box status-high-risk";
            document.getElementById("kpi-card-gap").className = "kpi-card border-red";
            document.getElementById("kpi-card-risk").className = "kpi-card border-red";
        } else {
            riskBox.className = "status-box";
            riskBox.style.backgroundColor = "var(--color-blue-light)";
            riskBox.style.borderLeftColor = "var(--color-blue)";
            document.getElementById("kpi-card-gap").className = "kpi-card";
            document.getElementById("kpi-card-risk").className = "kpi-card";
        }

        // Confidence
        document.getElementById("ai-confidence").innerText = data.confidence;
        document.getElementById("ai-explanation").innerText = data.explanation;
    }

    function addAlert(data) {
        const container = document.getElementById("alerts-container");
        
        // Prevent dupes if it's polling
        if(container.firstElementChild && container.firstElementChild.innerHTML.includes(data.event) && container.firstElementChild.innerHTML.includes(data.risk_level)) {
            return;
        }

        const alertDiv = document.createElement("div");
        const isHighRisk = data.risk_level === "HIGH";
        
        alertDiv.className = `alert-card ${isHighRisk ? 'priority-high' : 'priority-medium'}`;
        
        const timeStr = new Date().toLocaleTimeString();
        
        alertDiv.innerHTML = `
            <div class="alert-title">${data.event} - Risk: ${data.risk_level}</div>
            <div class="alert-detail">Demand: ${data.required_workers} | Available: ${data.available_workers}</div>
            <div class="alert-time">${timeStr}</div>
        `;
        
        container.prepend(alertDiv);
        
        // Keep only top 5 alerts
        if (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }

    // Interaction Functions
    const btnDeploy = document.getElementById("btn-deploy");
    if (btnDeploy) {
        btnDeploy.addEventListener("click", () => {
            btnDeploy.textContent = "Deploying...";
            btnDeploy.style.backgroundColor = "var(--color-green)";
            
            setTimeout(() => {
                btnDeploy.textContent = "Recommendation Executed ✓";
            }, 1000);
        });
    }

    const btnContractor = document.getElementById("btn-contractor");
    if (btnContractor) {
        btnContractor.addEventListener("click", () => {
            btnContractor.textContent = "Notifying Vendor...";
            setTimeout(() => {
                btnContractor.textContent = "Vendor Notified ✓";
                btnContractor.classList.remove('btn-secondary');
                btnContractor.classList.add('btn-primary');
                btnContractor.style.backgroundColor = "var(--color-green)";
                btnContractor.style.color = "white";
            }, 1000);
        });
    }
});
