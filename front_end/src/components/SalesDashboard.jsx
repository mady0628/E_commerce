import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesDashboard = ({ orders = [] }) => {
    // Biến lưu trạng thái tuần: 0 là tuần này, -1 là tuần trước, 1 là tuần sau...
    const [weekOffset, setWeekOffset] = useState(0);

    // Xào nấu dữ liệu: Tính lại khi mảng orders hoặc weekOffset thay đổi
    const { weekData, dateLabel } = useMemo(() => {
        // Lấy ngày hiện tại và cộng/trừ số ngày theo weekOffset
        const curr = new Date();
        curr.setDate(curr.getDate() + (weekOffset * 7));

        const firstDay = curr.getDate() - curr.getDay() + 1; // Tính ra ngày Thứ 2

        // Cột mốc bắt đầu (00:00:00 Thứ 2)
        const startOfWeek = new Date(curr.setDate(firstDay));
        startOfWeek.setHours(0, 0, 0, 0);

        // Cột mốc kết thúc (23:59:59 Chủ Nhật)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Format label hiển thị (VD: 15/05/2026 - 21/05/2026)
        const label = `${startOfWeek.toLocaleDateString('vi-VN')} - ${endOfWeek.toLocaleDateString('vi-VN')}`;

        // Khởi tạo 7 giỏ rỗng
        const data = [
            { name: 'Thứ 2', revenue: 0, orders: 0 },
            { name: 'Thứ 3', revenue: 0, orders: 0 },
            { name: 'Thứ 4', revenue: 0, orders: 0 },
            { name: 'Thứ 5', revenue: 0, orders: 0 },
            { name: 'Thứ 6', revenue: 0, orders: 0 },
            { name: 'Thứ 7', revenue: 0, orders: 0 },
            { name: 'CN', revenue: 0, orders: 0 },
        ];

        // Duyệt đơn hàng và phân loại
        orders.forEach(order => {
            if (order.status === 'success' && order.createdAt) {
                const orderDate = new Date(order.createdAt);

                // Nếu nằm trong tuần đang xem
                if (orderDate >= startOfWeek && orderDate <= endOfWeek) {
                    let dayIndex = orderDate.getDay() - 1;
                    if (dayIndex === -1) dayIndex = 6;

                    data[dayIndex].revenue += order.total;
                    data[dayIndex].orders += 1;
                }
            }
        });

        return { weekData: data, dateLabel: label };
    }, [orders, weekOffset]);

    return (
        <div style={{ width: '100%', height: '520px', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>📊 Doanh Thu Theo Tuần</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}
                    >
                        &larr; Tuần Trước
                    </button>

                    <span style={{ fontWeight: '500', color: '#555', minWidth: '180px', textAlign: 'center' }}>
                        {weekOffset === 0 ? "Tuần Này" : dateLabel}
                    </span>

                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        disabled={weekOffset >= 0}
                        style={{ padding: '8px 15px', cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: weekOffset >= 0 ? '#eee' : '#f9f9f9', fontWeight: 'bold', color: weekOffset >= 0 ? '#aaa' : '#000' }}
                    >
                        Tuần Sau &rarr;
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={weekData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#555" />

                    {/* Trục Y cho tiền (Bên trái) */}
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8"
                        tickFormatter={(value) => `${(value / 1000).toLocaleString('vi-VN')}k`} />

                    {/* Trục Y cho số đơn (Bên phải) */}
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" allowDecimals={false} />

                    <Tooltip
                        formatter={(value, name) => [
                            name === 'revenue' ? `${value.toLocaleString('vi-VN')} đ` : value,
                            name === 'revenue' ? 'Doanh thu' : 'Số đơn'
                        ]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar yAxisId="right" dataKey="orders" name="Số đơn hàng" fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesDashboard;
