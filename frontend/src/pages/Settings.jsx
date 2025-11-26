import React, { useState } from 'react';
import { Save, Moon, Sun, Lock, User, Building2 } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('dark');
    
    const [profileData, setProfileData] = useState({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@tradetrack.com',
        phone: '9876543210',
        company: 'TradeTrack Inc'
    });

    const [brandingData, setBrandingData] = useState({
        companyName: 'TradeTrack Global',
        logo: 'TT',
        primaryColor: '#6366f1',
        secondaryColor: '#06b6d4',
        timezone: 'UTC+05:30'
    });

    const [permissions, setPermissions] = useState({
        canGenerateInvoices: true,
        canViewReports: true,
        canManageClients: true,
        canManageInventory: true,
        canExportData: false,
        canDeleteInvoices: false
    });

    const handleProfileChange = (field, value) => {
        setProfileData({ ...profileData, [field]: value });
    };

    const handleBrandingChange = (field, value) => {
        setBrandingData({ ...brandingData, [field]: value });
    };

    const handlePermissionChange = (field) => {
        setPermissions({ ...permissions, [field]: !permissions[field] });
    };

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <AdminLayout>
            <div className="settings">
                {/* Header */}
                <div className="settings-header">
                    <div>
                        <h1>Settings</h1>
                        <p>Manage your profile, company branding, and permissions</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                        className={`tab ${activeTab === 'branding' ? 'active' : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Building2 className="w-4 h-4" /> Branding
                    </button>
                    <button
                        className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('permissions')}
                    >
                        <Lock className="w-4 h-4" /> Permissions
                    </button>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2>Personal Information</h2>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => handleProfileChange('company', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="theme-section">
                                <h3>Theme Preference</h3>
                                <div className="theme-toggle">
                                    <button
                                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="w-4 h-4" /> Light
                                    </button>
                                    <button
                                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="w-4 h-4" /> Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Branding Tab */}
                    {activeTab === 'branding' && (
                        <div className="settings-section">
                            <h2>Company Branding</h2>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        value={brandingData.companyName}
                                        onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Logo Text</label>
                                    <input
                                        type="text"
                                        value={brandingData.logo}
                                        onChange={(e) => handleBrandingChange('logo', e.target.value)}
                                        maxLength="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Timezone</label>
                                    <select
                                        value={brandingData.timezone}
                                        onChange={(e) => handleBrandingChange('timezone', e.target.value)}
                                    >
                                        <option>UTC+05:30</option>
                                        <option>UTC+00:00</option>
                                        <option>UTC+08:00</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Primary Color</label>
                                    <div className="color-picker">
                                        <input
                                            type="color"
                                            value={brandingData.primaryColor}
                                            onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                                        />
                                        <span>{brandingData.primaryColor}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Secondary Color</label>
                                    <div className="color-picker">
                                        <input
                                            type="color"
                                            value={brandingData.secondaryColor}
                                            onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                                        />
                                        <span>{brandingData.secondaryColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Permissions Tab */}
                    {activeTab === 'permissions' && (
                        <div className="settings-section">
                            <h2>User Permissions</h2>

                            <div className="permissions-list">
                                {Object.entries(permissions).map(([key, value]) => (
                                    <div key={key} className="permission-item">
                                        <div className="permission-info">
                                            <label>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
                                            <p>Control access to this feature</p>
                                        </div>
                                        <div className="permission-toggle">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={() => handlePermissionChange(key)}
                                            />
                                            <span className={`toggle-slider ${value ? 'active' : ''}`}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
