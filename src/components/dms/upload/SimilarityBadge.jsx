import React from 'react';

const SimilarityBadge = ({ score }) => {
    let bgColor, textColor, text;
    if (score > 95) {
        bgColor = 'bg-red-100'; textColor = 'text-red-800'; text = 'Trùng khớp cao';
    } else if (score > 70) {
        bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; text = 'Tương đồng';
    } else {
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; text = 'Liên quan';
    }
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {text} ({score}%)
        </span>
    );
};

export default SimilarityBadge;