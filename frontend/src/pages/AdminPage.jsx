import { useState, useEffect } from 'react';
import { FallbackTester } from '../components/admin/FallbackTester';

const AdminPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FallbackTester Component */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <FallbackTester />
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 