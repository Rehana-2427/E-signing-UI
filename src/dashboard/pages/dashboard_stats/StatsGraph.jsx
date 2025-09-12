import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import consentAPi from "../../../api/consentAPi";
import './style.css';

const StatsGraph = () => {
    const [chartOptions, setChartOptions] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;
    const [hasData, setHasData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await consentAPi.getMonthlyStats(userEmail);
                const monthlyData = response.data;

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const documentsSent = new Array(12).fill(0);
                const documentsReceived = new Array(12).fill(0);

                monthlyData.forEach((item) => {
                    const monthLower = item.month.toLowerCase();
                    const index = months.findIndex(m => m.toLowerCase().startsWith(monthLower));
                    if (index !== -1) {
                        documentsSent[index] = item.totalSentConsents || 0;
                        documentsReceived[index] = item.totalReceivedConsents || 0;
                    }
                });

                const isEmpty = documentsSent.every(val => val === 0) && documentsReceived.every(val => val === 0);
                setHasData(!isEmpty);

                if (!isEmpty) {
                    setChartOptions({
                        legend: {
                            borderRadius: 0,
                            orient: "horizontal",
                            x: "right",
                            data: ["Consents", "Documents"]
                        },
                        grid: {
                            left: "8px",
                            right: "8px",
                            bottom: "0",
                            containLabel: true
                        },
                        tooltip: {
                            show: true,
                            backgroundColor: "rgba(0, 0, 0, .8)"
                        },
                        xAxis: [
                            {
                                type: "category",
                                data: months,
                                axisTick: {
                                    alignWithLabel: true
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLine: {
                                    show: true
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: "value",
                                min: 0,
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: true,
                                    interval: "auto"
                                }
                            }
                        ],
                        series: [
                            {
                                name: "Documents",
                                data: documentsReceived,
                                type: "bar",
                                barGap: 0,
                                color: "#bcbbdd",
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowOffsetY: -2,
                                        shadowColor: "rgba(0, 0, 0, 0.3)"
                                    }
                                }
                            },
                            {
                                name: "Consents",
                                data: documentsSent,
                                type: "bar",
                                color: "#7569b3",
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowOffsetY: -2,
                                        shadowColor: "rgba(0, 0, 0, 0.3)"
                                    }
                                }
                            }
                        ]
                    });
                } else {
                    setChartOptions(null);
                }
            } catch (error) {
                console.error("Error fetching consent stats:", error);
            }
        };

        fetchData();
    }, []);


    return (
        <div className="statsgraph">
            <h4><strong>Usage Statistics</strong></h4>
            <p>Monthly Stats: Total consents you sent and total documents you received</p>
            {chartOptions && hasData ? (
                <ReactECharts option={chartOptions} />
            ) : !hasData ? (
                <p>No consents and documents for you.</p>
            ) : (
                <p>Loading chart...</p>
            )}
        </div>
    );

};

export default StatsGraph;
