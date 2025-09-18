import React from 'react';
import { UserCircleIcon, BuildingOffice2Icon, BriefcaseIcon, KeyIcon } from '@heroicons/react/24/outline';

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start text-sm">
        <Icon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
            <span className="font-semibold text-gray-800">{label}:</span>
            <span className="text-gray-600 ml-1">{value}</span>
        </div>
    </div>
);


const AccessInfo = ({ user }) => {
    if (!user) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Quyền Truy Cập</h3>
            <div className="space-y-3">
                <InfoRow icon={UserCircleIcon} label="Người dùng" value={user.name} />
                <InfoRow icon={BuildingOffice2Icon} label="Phòng ban" value={user.department} />
                <InfoRow icon={BriefcaseIcon} label="Chức vụ" value={user.position} />
                <InfoRow icon={KeyIcon} label="Quyền" value={user.permissions.join(', ')} />
            </div>
        </div>
    );
};

export default AccessInfo;