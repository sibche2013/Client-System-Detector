/* Developed by Amin Arjmand & viazenetti GmbH (Christian Ludwig)
Email: aminarj2000@gmail.com | Site: aminarjmand.com | GitHub: @sibche2013 
*/

document.addEventListener("DOMContentLoaded", async function () {
    const unknown = '-';

    // 1. Screen Size Info
    const screenSize = window.screen.width + " × " + window.screen.height + " Pixels";
    document.getElementById("screen-info").textContent = screenSize;

    // 2. Network Connectivity Status
    const updateNetworkStatus = () => {
        document.getElementById("network-info").textContent = navigator.onLine ? "Online (Connected)" : "Offline (No Internet)";
    };
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // 3. Battery API Setup
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            const updateBatteryDisplay = () => {
                const percentage = Math.round(battery.level * 100) + "%";
                const status = battery.charging ? " (Charging)" : " (Discharging)";
                document.getElementById("battery-info").textContent = percentage + status;
            };
            battery.addEventListener('levelchange', updateBatteryDisplay);
            battery.addEventListener('chargingchange', updateBatteryDisplay);
            updateBatteryDisplay();
        } catch (e) {
            document.getElementById("battery-info").textContent = "Not Supported / Blocked";
        }
    } else {
        document.getElementById("battery-info").textContent = "Not Supported by Browser";
    }

    // 4. Browser / Agent Parsing Logic
    const userAgent = navigator.userAgent;
    let browserName = navigator.appName;
    let browserVersion = "" + parseFloat(navigator.appVersion);
    let verOffset, nameOffset, ix;

    if ((verOffset = userAgent.indexOf("Opera")) !== -1) {
        browserName = "Opera";
        browserVersion = userAgent.substring(verOffset + 6);
        if ((verOffset = userAgent.indexOf("Version")) !== -1) {
            browserVersion = userAgent.substring(verOffset + 8);
        }
    } else if ((verOffset = userAgent.indexOf("OPR")) !== -1) {
        browserName = "Opera";
        browserVersion = userAgent.substring(verOffset + 4);
    } else if ((verOffset = userAgent.indexOf("Edg")) !== -1) {
        browserName = "Microsoft Edge";
        browserVersion = userAgent.substring(verOffset + 4);
    } else if ((verOffset = userAgent.indexOf("MSIE")) !== -1) {
        browserName = "Microsoft Internet Explorer";
        browserVersion = userAgent.substring(verOffset + 5);
    } else if (userAgent.indexOf("Trident/") !== -1) {
        browserName = "Microsoft Internet Explorer";
        browserVersion = userAgent.substring(userAgent.indexOf("rv:") + 3);
    } else if ((verOffset = userAgent.indexOf("Chrome")) !== -1) {
        browserName = "Chrome";
        browserVersion = userAgent.substring(verOffset + 7);
    } else if ((verOffset = userAgent.indexOf("Safari")) !== -1) {
        browserName = "Safari";
        browserVersion = userAgent.substring(verOffset + 7);
        if ((verOffset = userAgent.indexOf("Version")) !== -1) {
            browserVersion = userAgent.substring(verOffset + 8);
        }
    } else if ((verOffset = userAgent.indexOf("Firefox")) !== -1) {
        browserName = "Firefox";
        browserVersion = userAgent.substring(verOffset + 8);
    } else if ((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) {
        browserName = userAgent.substring(nameOffset, verOffset);
        browserVersion = userAgent.substring(verOffset + 1);
        if (browserName.toLowerCase() === browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }

    // Clean up version string
    if ((ix = browserVersion.indexOf(";")) !== -1) browserVersion = browserVersion.substring(0, ix);
    if ((ix = browserVersion.indexOf(" ")) !== -1) browserVersion = browserVersion.substring(0, ix);
    if ((ix = browserVersion.indexOf(")")) !== -1) browserVersion = browserVersion.substring(0, ix);

    document.getElementById("browser-info").textContent = browserName + " (v" + browserVersion + ")";

    // 5. Native OS Matching
    let os = unknown;
    const clientStrings = [
        {s: 'Windows 10 / 11', r: /(Windows 10.0|Windows NT 10.0)/},
        {s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/},
        {s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/},
        {s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/},
        {s: 'Android', r: /Android/},
        {s: 'Linux', r: /(Linux|X11)/},
        {s: 'iOS', r: /(iPhone|iPad|iPod)/},
        {s: 'Mac OS X', r: /Mac OS X/},
        {s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/}
    ];

    for (let id in clientStrings) {
        let cs = clientStrings[id];
        if (cs.r.test(userAgent)) {
            os = cs.s;
            break;
        }
    }

    let osVersion = unknown;
    if (/Windows/.test(os)) {
        osVersion = "NT Framework";
        os = 'Windows';
    }

    // Modern Windows 11 High-Accuracy Fallback API
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const uaHints = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]);
            if (navigator.userAgentData.platform === "Windows") {
                const majorPlatformVersion = parseInt(uaHints.platformVersion.split('.')[0]);
                if (majorPlatformVersion >= 13) {
                    os = "Windows";
                    osVersion = "11 (Modern Platform)";
                } else {
                    os = "Windows";
                    osVersion = "10";
                }
            }
        } catch (e) {}
    }

    if (osVersion === unknown || osVersion === "NT Framework") {
        if (/Mac OS X/.test(userAgent)) {
            const match = /Mac OS X (10[\.\_\d]+)/.exec(userAgent);
            if (match) osVersion = match[1].replace(/_/g, '.');
        } else if (/Android/.test(userAgent)) {
            const match = /Android ([\.\_\d]+)/.exec(userAgent);
            if (match) osVersion = match[1];
        } else if (/iPhone|iPad|iPod/.test(userAgent)) {
            const match = /OS (\d+)_(\d+)_?(\d+)?/.exec(navigator.appVersion);
            if (match) osVersion = match[1] + '.' + match[2] + '.' + (match[3] || '0');
        }
    }

    document.getElementById("os-info").textContent = os + " " + (osVersion !== unknown ? osVersion : "");

    // 6. Device Type Evaluation Badge
    const isMobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion) || (navigator.userAgentData && navigator.userAgentData.mobile);
    const badge = document.getElementById("device-badge");
    if (isMobile) {
        badge.textContent = "📱 Mobile Browser Environment";
        badge.style.background = "#e67e22";
    } else {
        badge.textContent = "💻 Desktop Browser Environment";
        badge.style.background = "#2ecc71";
    }
});
