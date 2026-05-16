import SalesDashboard from '../../components/SalesDashboard';

function DashboardPanel({
  orders,
}) {
  return (
          <div className="admin-panel" key="dashboard">
            <SalesDashboard orders={orders} />
          </div>
        );
}

export default DashboardPanel;
