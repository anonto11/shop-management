import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  BarChart3,
  Moon,
  Sun,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { formatCurrency } from './lib/translations';
import './App.css';

// Excel-like Table Component
function ExcelTable({ title, data, columns, onAdd, onEdit, onDelete, showTotal = false, totalField = null }) {
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const { state } = useApp();

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditingData({ ...row });
  };

  const handleSave = () => {
    onEdit(editingData);
    setEditingId(null);
    setEditingData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleAddNew = () => {
    setIsAdding(true);
    const template = {};
    columns.forEach(col => {
      template[col.key] = col.type === 'number' ? 0 : col.type === 'date' ? new Date().toISOString().split('T')[0] : '';
    });
    setNewRowData({ ...template, id: Date.now() });
  };

  const handleSaveNew = () => {
    onAdd(newRowData);
    setIsAdding(false);
    setNewRowData({});
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewRowData({});
  };

  const handleInputChange = (field, value, isNewRow = false) => {
    if (isNewRow) {
      setNewRowData(prev => ({ ...prev, [field]: value }));
    } else {
      setEditingData(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderCell = (row, column, isEditing = false, isNewRow = false) => {
    const value = isNewRow ? newRowData[column.key] : (isEditing ? editingData[column.key] : row[column.key]);
    
    if (isEditing || isNewRow) {
      if (column.type === 'select') {
        return (
          <select
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value || ''}
            onChange={(e) => handleInputChange(column.key, e.target.value, isNewRow)}
          >
            <option value="">Select...</option>
            {column.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      } else if (column.type === 'number') {
        return (
          <Input
            type="number"
            step="0.01"
            className="w-full text-sm"
            value={value || ''}
            onChange={(e) => handleInputChange(column.key, parseFloat(e.target.value) || 0, isNewRow)}
          />
        );
      } else if (column.type === 'date') {
        return (
          <Input
            type="date"
            className="w-full text-sm"
            value={value || ''}
            onChange={(e) => handleInputChange(column.key, e.target.value, isNewRow)}
          />
        );
      } else {
        return (
          <Input
            type="text"
            className="w-full text-sm"
            value={value || ''}
            onChange={(e) => handleInputChange(column.key, e.target.value, isNewRow)}
          />
        );
      }
    }

    // Display mode
    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'currency') {
      return formatCurrency(value || 0, state.language);
    }

    if (column.type === 'number') {
      return (value || 0).toLocaleString();
    }

    return value || '';
  };

  const calculateTotal = () => {
    if (!showTotal || !totalField) return 0;
    return data.reduce((sum, row) => sum + (row[totalField] || 0), 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => (
                  <th key={column.key} className="text-left p-3 font-medium text-sm border border-gray-300">
                    {column.label}
                  </th>
                ))}
                <th className="text-left p-3 font-medium text-sm border border-gray-300 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* New row form */}
              {isAdding && (
                <tr className="bg-blue-50">
                  {columns.map((column) => (
                    <td key={column.key} className="p-2 border border-gray-300">
                      {renderCell(null, column, false, true)}
                    </td>
                  ))}
                  <td className="p-2 border border-gray-300">
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={handleSaveNew}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelNew}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Data rows */}
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="p-2 border border-gray-300">
                      {renderCell(row, column, editingId === row.id)}
                    </td>
                  ))}
                  <td className="p-2 border border-gray-300">
                    {editingId === row.id ? (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={handleSave}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(row.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Total row */}
              {showTotal && totalField && data.length > 0 && (
                <tr className="bg-gray-100 font-medium">
                  <td colSpan={columns.length - 1} className="p-3 text-right border border-gray-300">
                    Total:
                  </td>
                  <td className="p-3 border border-gray-300">
                    {formatCurrency(calculateTotal(), state.language)}
                  </td>
                  <td className="p-3 border border-gray-300"></td>
                </tr>
              )}
            </tbody>
          </table>
          
          {data.length === 0 && !isAdding && (
            <div className="text-center py-8 text-gray-500">
              No data available. Click "Add New" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Products Table
function ProductsTable() {
  const { state, dispatch, ActionTypes } = useApp();

  const columns = [
    { key: 'sku', label: 'SKU', type: 'text' },
    { key: 'name', label: 'পণ্যের নাম | Product Name', type: 'text' },
    { key: 'unit', label: 'একক | Unit', type: 'select', options: [
      { value: 'pcs', label: 'Pieces' },
      { value: 'kg', label: 'Kilogram' },
      { value: 'ltr', label: 'Liter' },
      { value: 'box', label: 'Box' }
    ]},
    { key: 'openingStock', label: 'প্রাথমিক স্টক | Opening Stock', type: 'number' },
    { key: 'openingCost', label: 'প্রাথমিক খরচ | Opening Cost', type: 'currency' },
    { key: 'currentStock', label: 'বর্তমান স্টক | Current Stock', type: 'number', render: (value, row) => {
      const purchased = state.purchases.filter(p => p.sku === row.sku).reduce((sum, p) => sum + (p.quantity || 0), 0);
      const sold = state.sales.filter(s => s.sku === row.sku).reduce((sum, s) => sum + (s.quantity || 0), 0);
      const current = (row.openingStock || 0) + purchased - sold;
      return <span className={current <= 5 ? 'text-red-600' : 'text-green-600'}>{current}</span>;
    }}
  ];

  const handleAdd = (product) => {
    dispatch({ type: ActionTypes.ADD_PRODUCT, payload: product });
  };

  const handleEdit = (product) => {
    dispatch({ type: ActionTypes.UPDATE_PRODUCT, payload: product });
  };

  const handleDelete = (id) => {
    dispatch({ type: ActionTypes.DELETE_PRODUCT, payload: id });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">পণ্য | Products</h2>
      <ExcelTable
        title={`পণ্য তালিকা | Products List (${state.products.length} items)`}
        data={state.products}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

// Purchases Table
function PurchasesTable() {
  const { state, dispatch, ActionTypes } = useApp();

  const columns = [
    { key: 'date', label: 'তারিখ | Date', type: 'date' },
    { key: 'sku', label: 'SKU', type: 'select', options: state.products.map(p => ({ value: p.sku, label: `${p.sku} - ${p.name}` })) },
    { key: 'quantity', label: 'পরিমাণ | Quantity', type: 'number' },
    { key: 'unitCost', label: 'একক দাম | Unit Cost', type: 'currency' },
    { key: 'supplier', label: 'সাপ্লায়ার | Supplier', type: 'text' },
    { key: 'total', label: 'মোট | Total', type: 'currency', render: (value, row) => {
      const total = (row.quantity || 0) * (row.unitCost || 0);
      return formatCurrency(total, state.language);
    }}
  ];

  const handleAdd = (purchase) => {
    const total = purchase.quantity * purchase.unitCost;
    dispatch({ type: ActionTypes.ADD_PURCHASE, payload: { ...purchase, total } });
  };

  const handleEdit = (purchase) => {
    const total = purchase.quantity * purchase.unitCost;
    dispatch({ type: ActionTypes.UPDATE_PURCHASE, payload: { ...purchase, total } });
  };

  const handleDelete = (id) => {
    dispatch({ type: ActionTypes.DELETE_PURCHASE, payload: id });
  };

  const totalPurchases = state.purchases.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitCost || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">কেনা | Purchases</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">মোট কেনা | Total Purchase</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalPurchases, state.language)}
          </div>
        </div>
      </div>
      <ExcelTable
        title={`ক্রয় তালিকা | Purchase List (${state.purchases.length} entries)`}
        data={state.purchases}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showTotal={true}
        totalField="total"
      />
    </div>
  );
}

// Sales Table
function SalesTable() {
  const { state, dispatch, ActionTypes } = useApp();

  const columns = [
    { key: 'date', label: 'তারিখ | Date', type: 'date' },
    { key: 'sku', label: 'SKU', type: 'select', options: state.products.map(p => ({ value: p.sku, label: `${p.sku} - ${p.name}` })) },
    { key: 'quantity', label: 'পরিমাণ | Quantity', type: 'number' },
    { key: 'unitPrice', label: 'বিক্রয় দাম | Unit Price', type: 'currency' },
    { key: 'customer', label: 'কাস্টমার | Customer', type: 'text' },
    { key: 'revenue', label: 'আয় | Revenue', type: 'currency', render: (value, row) => {
      const revenue = (row.quantity || 0) * (row.unitPrice || 0);
      return formatCurrency(revenue, state.language);
    }}
  ];

  const handleAdd = (sale) => {
    const revenue = sale.quantity * sale.unitPrice;
    dispatch({ type: ActionTypes.ADD_SALE, payload: { ...sale, revenue } });
  };

  const handleEdit = (sale) => {
    const revenue = sale.quantity * sale.unitPrice;
    dispatch({ type: ActionTypes.UPDATE_SALE, payload: { ...sale, revenue } });
  };

  const handleDelete = (id) => {
    dispatch({ type: ActionTypes.DELETE_SALE, payload: id });
  };

  const totalSales = state.sales.reduce((sum, s) => sum + ((s.quantity || 0) * (s.unitPrice || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">বিক্রি</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">মোট বিক্রি</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalSales, state.language)}
          </div>
        </div>
      </div>
      <ExcelTable
        title={`বিক্রয় তালিকা | Sales List (${state.sales.length} entries)`}
        data={state.sales}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showTotal={true}
        totalField="revenue"
      />
    </div>
  );
}

// Expenses Table
function ExpensesTable() {
  const { state, dispatch, ActionTypes } = useApp();

  const columns = [
    { key: 'date', label: 'তারিখ | Date', type: 'date' },
    { key: 'category', label: 'ক্যাটাগরি | Category', type: 'select', options: [
      { value: 'rent', label: 'Rent' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'salary', label: 'Salary' },
      { value: 'transport', label: 'Transport' },
      { value: 'other', label: 'Other' }
    ]},
    { key: 'amount', label: 'পরিমাণ | Amount', type: 'currency' },
    { key: 'note', label: 'নোট | Note', type: 'text' }
  ];

  const handleAdd = (expense) => {
    dispatch({ type: ActionTypes.ADD_EXPENSE, payload: expense });
  };

  const handleEdit = (expense) => {
    dispatch({ type: ActionTypes.UPDATE_EXPENSE, payload: expense });
  };

  const handleDelete = (id) => {
    dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: id });
  };

  const totalExpenses = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">খরচ</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">মোট খরচ</div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses, state.language)}
          </div>
        </div>
      </div>
      <ExcelTable
        title={`খরচের তালিকা | Expenses List (${state.expenses.length} entries)`}
        data={state.expenses}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showTotal={true}
        totalField="amount"
      />
    </div>
  );
}

// Reports and Analytics
function Reports() {
  const { state } = useApp();

  const totalPurchases = state.purchases.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitCost || 0)), 0);
  const totalSales = state.sales.reduce((sum, s) => sum + ((s.quantity || 0) * (s.unitPrice || 0)), 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;

  // Product-wise performance
  const productPerformance = state.products.map(product => {
    const purchased = state.purchases.filter(p => p.sku === product.sku).reduce((sum, p) => sum + (p.quantity || 0), 0);
    const sold = state.sales.filter(s => s.sku === product.sku).reduce((sum, s) => sum + (s.quantity || 0), 0);
    const revenue = state.sales.filter(s => s.sku === product.sku).reduce((sum, s) => sum + ((s.quantity || 0) * (s.unitPrice || 0)), 0);
    const cost = state.purchases.filter(p => p.sku === product.sku).reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitCost || 0)), 0);
    const currentStock = (product.openingStock || 0) + purchased - sold;
    
    return {
      ...product,
      purchased,
      sold,
      revenue,
      cost,
      profit: revenue - cost,
      currentStock
    };
  });

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">রিপোর্ট | Reports</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">মোট ক্রয় | Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPurchases, state.language)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">মোট বিক্রয় | Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSales, state.language)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">মোট লাভ | Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(grossProfit), state.language)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">নেট লাভ | Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netProfit), state.language)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>পণ্যের কর্মক্ষমতা | Product Performance</CardTitle>
          <Button 
            onClick={() => exportToCSV(productPerformance, 'product-performance.csv')}
            size="sm"
          >
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">SKU</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">পণ্যের নাম | Product</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">ক্রয় | Purchased</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">বিক্রয় | Sold</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">স্টক | Stock</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">আয় | Revenue</th>
                  <th className="text-left p-3 font-medium text-sm border border-gray-300">লাভ | Profit</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">{product.sku}</td>
                    <td className="p-3 border border-gray-300">{product.name}</td>
                    <td className="p-3 border border-gray-300">{product.purchased}</td>
                    <td className="p-3 border border-gray-300">{product.sold}</td>
                    <td className={`p-3 border border-gray-300 ${product.currentStock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.currentStock}
                    </td>
                    <td className="p-3 border border-gray-300">{formatCurrency(product.revenue, state.language)}</td>
                    <td className={`p-3 border border-gray-300 ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(product.profit), state.language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      {/* <Card>
        <CardHeader>
          <CardTitle>ডেটা রপ্তানি | Data Export</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => exportToCSV(state.products, 'products.csv')}
            variant="outline"
          >
            Export Products
          </Button>
          <Button 
            onClick={() => exportToCSV(state.purchases, 'purchases.csv')}
            variant="outline"
          >
            Export Purchases
          </Button>
          <Button 
            onClick={() => exportToCSV(state.sales, 'sales.csv')}
            variant="outline"
          >
            Export Sales
          </Button>
          <Button 
            onClick={() => exportToCSV(state.expenses, 'expenses.csv')}
            variant="outline"
          >
            Export Expenses
          </Button>
        </CardContent>
      </Card> */}

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>আর্থিক সারসংক্ষেপ | Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium">মোট ক্রয় | Total Purchases:</span>
              <span className="text-blue-600 font-bold">{formatCurrency(totalPurchases, state.language)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">মোট বিক্রয় | Total Sales:</span>
              <span className="text-green-600 font-bold">{formatCurrency(totalSales, state.language)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="font-medium">মোট খরচ | Total Expenses:</span>
              <span className="text-yellow-600 font-bold">{formatCurrency(totalExpenses, state.language)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
                <span className="font-bold text-lg">নেট লাভ/ক্ষতি | Net Profit/Loss:</span>
                <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netProfit), state.language)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard with live calculations
function Dashboard() {
  const { state } = useApp();

  const totalPurchases = state.purchases.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitCost || 0)), 0);
  const totalSales = state.sales.reduce((sum, s) => sum + ((s.quantity || 0) * (s.unitPrice || 0)), 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">ড্যাশবোর্ড | Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কত কিনলাম | Total Purchase</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchases, state.language)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">কত বেচলাম | Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales, state.language)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট খরচ | Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses, state.language)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নেট লাভ | Net Profit</CardTitle>
            <TrendingUp className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netProfit), state.language)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>নতুন কেনা | New Purchase</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>নতুন বিক্রি | New Sale</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>নতুন খরচ | New Expense</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>নতুন পণ্য | New Product</span>
          </Button>
        </CardContent>
      </Card> */}

      {/* Recent Activity */}
      {(state.purchases.length > 0 || state.sales.length > 0 || state.expenses.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.purchases.slice(-3).map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span>Purchase: {p.sku} - {p.quantity} units</span>
                  <span className="text-blue-600">{formatCurrency((p.quantity || 0) * (p.unitCost || 0), state.language)}</span>
                </div>
              ))}
              {state.sales.slice(-3).map(s => (
                <div key={s.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span>Sale: {s.sku} - {s.quantity} units</span>
                  <span className="text-green-600">{formatCurrency((s.quantity || 0) * (s.unitPrice || 0), state.language)}</span>
                </div>
              ))}
              {state.expenses.slice(-3).map(e => (
                <div key={e.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span>Expense: {e.category}</span>
                  <span className="text-red-600">{formatCurrency(e.amount || 0, state.language)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }) {
  const navigationItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'ড্যাশবোর্ড | Dashboard' },
    { key: 'products', icon: Package, label: 'পণ্য | Products' },
    { key: 'purchases', icon: ShoppingCart, label: 'কেনা | Purchases' },
    { key: 'sales', icon: TrendingUp, label: 'বিক্রি | Sales' },
    { key: 'expenses', icon: Receipt, label: 'খরচ | Expenses' },
    { key: 'reports', icon: BarChart3, label: 'রিপোর্ট | Reports' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          
          return (
            <Button
              key={item.key}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab(item.key)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

function Header() {
  const { state, dispatch, ActionTypes } = useApp();

  const toggleLanguage = () => {
    const newLanguage = state.language === 'bn' ? 'en' : 'bn';
    dispatch({ type: ActionTypes.SET_LANGUAGE, payload: newLanguage });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Taqwa managment
        </h1>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="h-4 w-4 mr-2" />
            {state.language === 'bn' ? 'English' : 'বাংলা'}
          </Button>
          
          
        </div>
      </div>
    </header>
  );
}

function MainContent({ activeTab }) {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'products':
      return <ProductsTable />;
    case 'purchases':
      return <PurchasesTable />;
    case 'sales':
      return <SalesTable />;
    case 'expenses':
      return <ExpensesTable />;
    case 'reports':
      return <Reports />;
    default:
      return <Dashboard />;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <MainContent activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

