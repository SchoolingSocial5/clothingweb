import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Sales", value: "$45,231.89", trend: "+20.1%", positive: true },
    { label: "Active Customers", value: "2,350", trend: "+15.2%", positive: true },
    { label: "Total Orders", value: "12,234", trend: "+8.1%", positive: true },
    { label: "Revenue", value: "$124,563.00", trend: "-2.4%", positive: false },
  ];

  const recentCustomers = [
    { id: 1, name: "Alice Freeman", email: "alice@example.com", amount: "$320.00", status: "Completed" },
    { id: 2, name: "Bobby Tables", email: "bobby@example.com", amount: "$150.00", status: "Pending" },
    { id: 3, name: "Charlie Davis", email: "charlie@example.com", amount: "$890.50", status: "Completed" },
    { id: 4, name: "Diana Prince", email: "diana@example.com", amount: "$45.00", status: "Processing" },
    { id: 5, name: "Evan Wright", email: "evan@example.com", amount: "$210.00", status: "Completed" },
  ];

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stat.value}</h3>
              <span className={`text-sm font-semibold px-2 py-1 rounded-md ${stat.positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Customers List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Customers</h3>
          <button className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      user.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold">
                    {user.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
