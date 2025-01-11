import React, { useState, useEffect, useContext } from 'react';
    import { Coins, ArrowDown, ArrowUp, Plus, Minus, Edit2, Trash2, Calendar } from 'lucide-react';
    import { formatDate, getWeekNumber } from '../utils/dateUtils';
    import { ActivityContext } from '../context/ActivityContext';

    interface Transaction {
      id: string;
      type: 'income' | 'expense';
      name: string;
      amount: number;
      date: string;
      createActivity: boolean;
    }

    export function Financial() {
      const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('financialTransactions');
        return saved ? JSON.parse(saved) : [];
      });
      const [balance, setBalance] = useState(0);
      const [newTransaction, setNewTransaction] = useState({
        type: 'income' as 'income' | 'expense',
        name: '',
        amount: 0,
        date: formatDate(new Date()),
        createActivity: true,
      });
      const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
      const { addActivity, updateActivity } = useContext(ActivityContext);

      useEffect(() => {
        localStorage.setItem('financialTransactions', JSON.stringify(transactions));
        calculateBalance();
      }, [transactions]);

      const calculateBalance = () => {
        const newBalance = transactions.reduce((acc, transaction) => {
          return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        setBalance(newBalance);
      };

      const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTransaction.name || newTransaction.amount === 0) return;

        const transaction: Transaction = {
          id: crypto.randomUUID(),
          ...newTransaction,
        };
        setTransactions(prev => [...prev, transaction]);

        if (newTransaction.createActivity) {
          const transactionDate = new Date(newTransaction.date);
          const weekNumber = getWeekNumber(transactionDate);
          const year = transactionDate.getFullYear();

          addActivity({
            title: `${transaction.type === 'income' ? 'وارد' : 'صادر'} - ${transaction.name}`,
            description: `المبلغ: ${transaction.amount}`,
            domainId: 'financial',
            selectedDays: [transactionDate.getDay()],
            allowSunday: true,
            weekNumber,
            year,
            completedDays: {
              [transactionDate.getDay()]: true
            }
          });
        }

        setNewTransaction({ type: 'income', name: '', amount: 0, date: formatDate(new Date()), createActivity: true });
      };

      const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setNewTransaction(transaction);
      };

      const handleUpdateTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTransaction) return;

        setTransactions(prev =>
          prev.map(transaction =>
            transaction.id === editingTransaction.id ? { ...newTransaction, id: editingTransaction.id } : transaction
          )
        );
        setEditingTransaction(null);
        setNewTransaction({ type: 'income', name: '', amount: 0, date: formatDate(new Date()), createActivity: true });
      };

      const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      };

      const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTransaction({ ...newTransaction, date: e.target.value });
      };

      const inputClasses = "w-full p-2 border rounded-md bg-black/20 text-white border-amber-400/30 placeholder-white/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none";

      return (
        <div className="p-6 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 rounded-lg shadow-lg text-white" dir="rtl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Coins size={32} />
              إدارة المصاريف
            </h2>
            <div className="text-xl font-bold">
              الرصيد: <span className={balance >= 0 ? 'text-green-400' : 'text-red-400'}>{balance}</span>
            </div>
          </div>

          <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} className="space-y-4 mb-6">
            <div className="flex gap-2">
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                className={inputClasses}
              >
                <option value="income">وارد</option>
                <option value="expense">صادر</option>
              </select>
              <input
                type="text"
                value={newTransaction.name}
                onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
                placeholder="اسم العملية"
                className={inputClasses}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                placeholder="المبلغ"
                className={inputClasses}
              />
              <div className="relative">
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={handleDateChange}
                  className={inputClasses}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createActivity"
                checked={newTransaction.createActivity}
                onChange={(e) => setNewTransaction({ ...newTransaction, createActivity: e.target.checked })}
              />
              <label htmlFor="createActivity" className="text-white" dir="rtl">
                إنشاء نشاط في الأيام والمجالات
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black p-2 rounded-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              {editingTransaction ? 'تعديل العملية' : 'إضافة عملية'}
              {editingTransaction ? <Edit2 size={20} /> : <Plus size={20} />}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-white border border-white/20">النوع</th>
                  <th className="p-2 text-white border border-white/20">الاسم</th>
                  <th className="p-2 text-white border border-white/20">المبلغ</th>
                  <th className="p-2 text-white border border-white/20">التاريخ</th>
                  <th className="p-2 text-white border border-white/20"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-black/20 transition-colors">
                    <td className="p-2 text-white border border-white/20 text-center">
                      {transaction.type === 'income' ? (
                        <ArrowUp size={20} className="text-green-400 inline-block" />
                      ) : (
                        <ArrowDown size={20} className="text-red-400 inline-block" />
                      )}
                    </td>
                    <td className="p-2 text-white border border-white/20 text-right">{transaction.name}</td>
                    <td className="p-2 text-white border border-white/20 text-center">{transaction.amount}</td>
                    <td className="p-2 text-white border border-white/20 text-center">{transaction.date}</td>
                    <td className="p-2 text-white border border-white/20 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="text-amber-400/70 hover:text-amber-400 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-400/70 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
