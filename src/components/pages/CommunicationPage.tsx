'use client';

import { useState } from 'react';
import { Send, Search, MessageSquare, Mail, Bell } from 'lucide-react';

const messages = [
  { id: '1', from: 'Rahul Sharma', subject: 'Stall setup query', message: 'I need to know the exact dimensions of my stall A-101.', date: '2024-03-10', read: false },
  { id: '2', from: 'Priya Singh', subject: 'Badge collection', message: 'When can I collect my exhibitor badges?', date: '2024-03-11', read: true },
  { id: '3', from: 'Amit Patel', subject: 'Payment confirmation', message: 'I have made the payment. Please confirm receipt.', date: '2024-03-12', read: false },
  { id: '4', from: 'Sneha Reddy', subject: 'Extra furniture request', message: 'I need 2 extra chairs and 1 table for my stall.', date: '2024-03-13', read: true },
];

export default function CommunicationPage() {
  const [selected, setSelected] = useState(messages[0]);
  const [reply, setReply] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'send' | 'broadcast'>('inbox');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Communication</h2>
        <p className="text-sm text-gray-500">Manage messages and notifications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['inbox', 'send', 'broadcast'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)] min-h-[400px]">
          {/* Message List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search size={14} className="text-gray-400" />
                <input type="text" placeholder="Search messages..." className="bg-transparent text-sm outline-none w-full placeholder-gray-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={`p-3.5 cursor-pointer transition-colors ${selected.id === msg.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-semibold">{msg.from.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.from}</p>
                          {!msg.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{msg.date.split('-')[2]}/{msg.date.split('-')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">{selected.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">From:</span>
                <span className="text-xs font-medium text-gray-700">{selected.from}</span>
                <span className="text-xs text-gray-400 ml-auto">{selected.date}</span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none focus:border-blue-400 focus:bg-white transition-colors"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium self-end">
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Send Broadcast Message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Recipients</label>
              <select className="w-full bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2.5 outline-none border-0">
                <option>All Exhibitors</option>
                <option>Active Exhibitors</option>
                <option>Pending Exhibitors</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" placeholder="Message subject..." className="w-full bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2.5 outline-none border-0 focus:bg-gray-200 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={5} placeholder="Type your broadcast message..." className="w-full bg-gray-100 text-sm text-gray-700 rounded-lg px-3 py-2.5 outline-none border-0 resize-none focus:bg-gray-200 transition-colors" />
            </div>
            <button className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Bell size={16} />
              Send Broadcast
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
