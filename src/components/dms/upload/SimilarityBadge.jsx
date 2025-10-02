import React from 'react';

const SimilarityBadge = ({ score }) => {
    let bgColor, text;
    if (score > 90) {
        bgColor = 'bg-red-100 text-red-800'; text = `${score.toFixed(2)}%`;
    } else if (score > 30) {
        bgColor = 'bg-yellow-100 text-yellow-800'; text = `${score.toFixed(2)}%`;
    } else {
        bgColor = 'bg-green-100 text-green-800'; text = `${score.toFixed(2)}%`;
    }
    return <span className={`px-3 py-1 text-sm font-bold rounded-full ${bgColor}`}>{text}</span>;
};

export default SimilarityBadge;