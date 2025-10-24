'use client'

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">System Settings</h2>
        <button className="btn-primary">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">General Settings</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Site Name</label>
              <input type="text" className="form-input" defaultValue="MJ CHAUFFAGE" />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <select className="form-input">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tax Rate (%)</label>
              <input type="number" className="form-input" defaultValue="20" />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Email Settings</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">Email Notifications</span>
                <p className="text-xs text-neutral-500">Send automatic email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">Order Confirmations</span>
                <p className="text-xs text-neutral-500">Send order confirmation emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Maintenance</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">Maintenance Mode</span>
                <p className="text-xs text-neutral-500">Put website in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div>
              <button className="btn-secondary w-full">
                Clear System Cache
              </button>
            </div>
            <div>
              <button className="btn-outline w-full">
                Run System Diagnostics
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Security</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Session Timeout (minutes)</label>
              <input type="number" className="form-input" defaultValue="30" />
            </div>
            <div>
              <label className="form-label">Failed Login Attempts Limit</label>
              <input type="number" className="form-input" defaultValue="5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">Two-Factor Authentication</span>
                <p className="text-xs text-neutral-500">Require 2FA for admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-neutral-900">System Settings</h3>
            <p className="text-neutral-500 mt-2">
              Complete system configuration interface will be implemented here.
              Features include payment gateway settings, shipping configuration, tax settings, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}