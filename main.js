// --- Navigation Logic ---
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const section = document.getElementById(targetId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        document
            .querySelectorAll(".nav-btn")
            .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// --- LocalStorage & Auto-Save Logic ---
const STORAGE_KEY = "campus_data_game_v2";
const saveStatusEl = document.getElementById("save-status");
const saveTextEl = document.getElementById("save-text");
let saveTimer = null;

function showSaving() {
    if (saveStatusEl && saveTextEl) {
        saveStatusEl.classList.add("show", "saving");
        saveTextEl.textContent = "正在保存...";
    }
}

function showSaved() {
    if (saveStatusEl && saveTextEl) {
        saveStatusEl.classList.remove("saving");
        saveTextEl.textContent = "已自动保存";
        setTimeout(() => {
            saveStatusEl.classList.remove("show");
        }, 2000);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        document.querySelectorAll("[data-save]").forEach((el) => {
            if (data[el.id] !== undefined) {
                el.value = data[el.id];
            }
        });
    } catch (e) {
        console.warn("loadState error", e);
    }
}

function saveState() {
    showSaving();
    const data = {};
    document.querySelectorAll("[data-save]").forEach((el) => {
        data[el.id] = el.value;
    });
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(showSaved, 600);
    } catch (e) {
        console.warn("saveState error", e);
    }
}

document.addEventListener("input", (e) => {
    if (e.target.matches("[data-save]")) {
        saveState();
        if (window.chartUpdateTimer) clearTimeout(window.chartUpdateTimer);
        window.chartUpdateTimer = setTimeout(updateCharts, 800);
    }
});

loadState();

// --- Data Model ---
const campusModel = {
    className: '',
    app: {
        name: '',
        goal: '',
        flow: '',
        data: ''
    },
    sources: [],
    dataTypes: {
        structured: '',
        semi: '',
        unstructured: ''
    },
    v5: {
        volume: '',
        velocity: '',
        variety: '',
        value: '',
        veracity: ''
    },
    collection: {
        log: '',
        iot: '',
        db: '',
        api: ''
    },
    storage: {
        dfs: '',
        nosql: '',
        cloud: '',
        rdb: ''
    }
};

function syncModelFromDOM() {
    // Helper to get value safely
    const val = (id) => document.getElementById(id)?.value?.trim() || "";

    campusModel.className = val('className');

    campusModel.app.name = val('appName');
    campusModel.app.goal = val('appGoal');
    campusModel.app.flow = val('flow');
    campusModel.app.data = val('appData');

    campusModel.sources = [val('ds1'), val('ds2'), val('ds3'), val('ds4')].filter(s => s);

    campusModel.dataTypes.structured = val('typeStructured');
    campusModel.dataTypes.semi = val('typeSemi');
    campusModel.dataTypes.unstructured = val('typeUnstructured');

    campusModel.v5.volume = val('vVolume');
    campusModel.v5.velocity = val('vVelocity');
    campusModel.v5.variety = val('vVariety');
    campusModel.v5.value = val('vValue');
    campusModel.v5.veracity = val('vVeracity');
}

// --- Chart Logic ---

let charts = {};

function initCharts() {
    if (typeof echarts === 'undefined') {
        console.warn("ECharts not loaded yet, retrying in 500ms...");
        setTimeout(initCharts, 500);
        return;
    }

    const chartTypesEl = document.getElementById('chart-types');
    const chartNetworkEl = document.getElementById('chart-network');
    const chart5vEl = document.getElementById('chart-5v');
    const chartFlowEl = document.getElementById('chart-flow');

    try {
        if (chartTypesEl && !charts.types) charts.types = echarts.init(chartTypesEl);
        if (chartNetworkEl && !charts.network) {
            charts.network = echarts.init(chartNetworkEl);
            charts.network.on('click', () => {
                document.getElementById('sec1').scrollIntoView({ behavior: 'smooth' });
            });
        }
        if (chart5vEl && !charts.v5) charts.v5 = echarts.init(chart5vEl);
        if (chartFlowEl && !charts.flow) {
            charts.flow = echarts.init(chartFlowEl);
        }

        console.log("Charts initialized successfully");
        updateCharts();
    } catch (err) {
        console.error("Error initializing charts:", err);
    }

    window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => chart && chart.resize());
    });
}

function countLines(text) {
    if (!text) return 0;
    return text.split(/[,，\n;；]/).filter(s => s.trim().length > 0).length;
}

function updateCharts() {
    // 1. Sync Model first
    syncModelFromDOM();

    // 2. Update Text Elements
    const outName = document.getElementById('out-appName');
    const outGoal = document.getElementById('out-appGoal');
    const outFlow = document.getElementById('out-flow');
    const outData = document.getElementById('out-appData');
    const outClass = document.getElementById('out-className');

    if (outName) outName.textContent = campusModel.app.name || "智慧校园大脑";
    if (outGoal) outGoal.textContent = campusModel.app.goal || "暂无设计目标...";
    if (outFlow) outFlow.textContent = campusModel.app.flow || "采集 -> 传输 -> 存储 -> 分析 -> 应用";
    if (outData) outData.textContent = campusModel.app.data || "暂无输入数据...";
    if (outClass) outClass.textContent = campusModel.className ? `Designer: ${campusModel.className}` : "Smart Campus Big Data System Blueprint";

    if (!charts.types) {
        initCharts();
        return;
    }

    console.log("Updating charts from model...");

    // 3. Data Types Pie
    const sCount = countLines(campusModel.dataTypes.structured) || 1;
    const semiCount = countLines(campusModel.dataTypes.semi) || 1;
    const uCount = countLines(campusModel.dataTypes.unstructured) || 1;

    charts.types.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', textStyle: { color: '#fff', fontSize: 10 } },
        series: [
            {
                name: '数据类型',
                type: 'pie',
                radius: ['40%', '70%'],
                itemStyle: { borderRadius: 5, borderColor: '#050816', borderWidth: 2 },
                label: { show: false },
                data: [
                    { value: sCount, name: '结构化', itemStyle: { color: '#3c82ff', shadowBlur: 10, shadowColor: '#3c82ff' } },
                    { value: semiCount, name: '半结构化', itemStyle: { color: '#00f2ff', shadowBlur: 10, shadowColor: '#00f2ff' } },
                    { value: uCount, name: '非结构化', itemStyle: { color: '#8ca6ff', shadowBlur: 10, shadowColor: '#8ca6ff' } }
                ]
            }
        ]
    });

    // 4. Network Graph
    const sources = campusModel.sources.map((s, index) => ({
        name: s,
        symbolSize: 30,
        category: 1,
        itemStyle: { color: '#00f2ff', shadowBlur: 10, shadowColor: '#00f2ff' }
    }));

    if (sources.length === 0) {
        sources.push({ name: '暂无数据源', symbolSize: 30, category: 1 });
    }

    const nodes = [{
        name: '大数据平台',
        symbolSize: 60,
        category: 0,
        fixed: false,
        itemStyle: { color: '#3c82ff', shadowBlur: 20, shadowColor: '#3c82ff' }
    }, ...sources];

    const links = sources.map(s => ({ source: '大数据平台', target: s.name }));

    charts.network.setOption({
        backgroundColor: 'transparent',
        tooltip: {},
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                label: { show: true, position: 'bottom', color: '#fff' },
                force: { repulsion: 400, edgeLength: 120, layoutAnimation: true },
                lineStyle: { color: '#fff', curveness: 0.1, width: 2, opacity: 0.5 }
            }
        ]
    });

    // 5. 5V Radar
    const score = (text) => Math.min(5, 1 + Math.floor(text.length / 10)); // Simple scoring 1-5
    const vScores = [
        score(campusModel.v5.volume),
        score(campusModel.v5.velocity),
        score(campusModel.v5.variety),
        score(campusModel.v5.value),
        score(campusModel.v5.veracity)
    ];

    charts.v5.setOption({
        backgroundColor: 'transparent',
        radar: {
            indicator: [
                { name: 'Volume', max: 5 },
                { name: 'Velocity', max: 5 },
                { name: 'Variety', max: 5 },
                { name: 'Value', max: 5 },
                { name: 'Veracity', max: 5 }
            ],
            axisName: { color: '#fff' },
            splitArea: { areaStyle: { color: ['rgba(60, 130, 255, 0.05)', 'rgba(60, 130, 255, 0.1)'] } },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: [
            {
                type: 'radar',
                data: [
                    {
                        value: vScores,
                        name: '数据特征',
                        areaStyle: { color: 'rgba(0, 242, 255, 0.4)' },
                        lineStyle: { color: '#00f2ff', width: 2 },
                        symbol: 'circle',
                        symbolSize: 6,
                        itemStyle: { color: '#fff' }
                    }
                ]
            }
        ]
    });

    // 6. Dynamic Flow Chart (Parsing "->" or "->")
    let flowText = campusModel.app.flow || "采集 -> 传输 -> 存储 -> 分析 -> 应用";
    // Normalize arrows
    flowText = flowText.replace(/→/g, '->');
    const steps = flowText.split('->').map(s => s.trim()).filter(s => s);

    if (steps.length < 2) {
        // Fallback if parsing fails
        steps.push("采集", "存储", "分析", "应用");
    }

    const flowNodes = steps.map((step, idx) => ({
        name: step,
        x: 100 + idx * 200,
        y: 100,
        symbolSize: 50,
        itemStyle: { color: idx % 2 === 0 ? '#3c82ff' : '#00f2ff' }
    }));

    const flowLinks = [];
    for (let i = 0; i < steps.length - 1; i++) {
        flowLinks.push({ source: steps[i], target: steps[i + 1] });
    }

    charts.flow.setOption({
        backgroundColor: 'transparent',
        tooltip: {},
        series: [
            {
                type: 'graph',
                layout: 'none',
                symbolSize: 50,
                roam: true,
                label: { show: true, color: '#fff', fontSize: 12, fontWeight: 'bold' },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [4, 10],
                data: flowNodes,
                links: flowLinks,
                lineStyle: {
                    color: '#00f2ff',
                    width: 4,
                    curveness: 0,
                    type: 'dashed'
                }
            }
        ]
    });
}

// --- Demo Data Logic ---
document.getElementById('btn-demo')?.addEventListener('click', () => {
    if (!confirm("确定要自动填入演示数据吗？这将覆盖你当前的内容。")) return;

    const demoData = {
        className: "高一(3)班 示例小组",
        ds1: "校门人脸识别闸机",
        ds2: "食堂智能消费终端",
        ds3: "图书馆RFID自助借还机",
        ds4: "宿舍智能控电系统",
        dsTypes: "人脸闸机包含图片（非结构化）和进出时间（结构化）；食堂消费包含金额、菜品（结构化）；图书馆包含书籍信息（结构化）。",
        typeStructured: "1. 学生一卡通消费记录\n2. 图书馆借阅历史\n3. 宿舍进出时间表\n4. 考试成绩单",
        typeSemi: "1. 校园网访问日志\n2. 门禁系统运行日志\n3. APP用户行为埋点",
        typeUnstructured: "1. 校门口监控视频流\n2. 人脸识别抓拍照片\n3. 图书馆电子书PDF\n4. 校园广播音频",
        vVolume: "全校500个高清摄像头，每天产生20TB视频数据，这是最大的数据源。",
        vVelocity: "早中晚高峰期，食堂刷卡机每秒并发处理2000笔交易，数据产生速度极快。",
        vVariety: "我们有视频(MP4)、图片(JPG)、消费记录(MySQL表)、日志(Log)等多种格式。",
        vValue: "通过分析食堂消费数据，可以预测热门菜品，减少浪费；分析图书借阅，优化馆藏。",
        vVeracity: "学生的学籍信息、考试成绩必须100%准确，不能有任何偏差。",
        cLog: "校园网服务器日志、教务系统操作日志",
        cIoT: "智能电表、温湿度传感器、PM2.5监测仪",
        cDB: "一卡通系统数据库、教务系统数据库",
        cAPI: "天气预报API、城市公交实时数据接口",
        sDFS: "HDFS分布式文件系统 (存储监控视频)",
        sNoSQL: "Redis/MongoDB (存储实时日志和高频刷卡数据)",
        sCloud: "阿里云OSS (存储电子书和网盘文件)",
        sRDB: "MySQL (存储学生档案和成绩)",
        appName: "智慧节能与安全预警大脑",
        appGoal: "通过分析用电和人流数据，实现宿舍无人时自动断电，并在发现异常大功率电器时预警，防止火灾。",
        appData: "实时电流、宿舍进出记录、历史用电模型",
        flow: "智能电表 -> MQTT网关 -> InfluxDB -> 异常检测算法 -> 宿管报警端"
    };

    Object.keys(demoData).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = demoData[id];
    });

    saveState();
    updateCharts();

    document.getElementById('sec8').scrollIntoView({ behavior: 'smooth' });
});

// --- Visibility Logic ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log("Dashboard visible, refreshing charts...");
            updateCharts();
            Object.values(charts).forEach(chart => chart && chart.resize());
        }
    });
}, { threshold: 0.1 });

const dashboardSection = document.getElementById('sec8');
if (dashboardSection) {
    observer.observe(dashboardSection);
}

// --- Export Logic ---
document.getElementById('btn-refresh').addEventListener('click', () => {
    const btn = document.getElementById('btn-refresh');
    const originalText = btn.textContent;
    btn.textContent = "⏳ 刷新中...";
    btn.disabled = true;

    updateCharts();

    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 500);
});

document.getElementById('btn-export').addEventListener('click', async () => {
    const dashboard = document.getElementById('dashboard-content');
    const exportTitle = dashboard.querySelector('.export-title');

    if (exportTitle) exportTitle.style.display = 'block';

    try {
        const canvas = await html2canvas(dashboard, {
            backgroundColor: '#050816',
            scale: 2,
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = 'smart-campus-blueprint.png';
        link.href = canvas.toDataURL();
        link.click();
    } catch (err) {
        console.error("Export failed", err);
        alert("导出失败，请重试");
    } finally {
        if (exportTitle) exportTitle.style.display = 'none';
    }
});

window.onload = () => {
    initCharts();
};
