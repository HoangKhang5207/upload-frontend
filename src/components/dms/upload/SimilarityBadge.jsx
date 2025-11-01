import React from 'react';
import { Tag } from 'antd';

const SimilarityBadge = ({ score }) => {
    let color, text;
    const numericScore = parseFloat(score) || 0; // Đảm bảo score là số

    if (numericScore > 90) {
        color = 'error'; // Antd color for red
        text = `${numericScore.toFixed(2)}%`;
    } else if (numericScore > 30) {
        color = 'warning'; // Antd color for yellow
        text = `${numericScore.toFixed(2)}%`;
    } else {
        color = 'success'; // Antd color for green
        text = `${numericScore.toFixed(2)}%`;
    }
    
    return <Tag color={color} style={{ fontSize: '14px', padding: '4px 8px', fontWeight: 'bold' }}>{text}</Tag>;
};

export default SimilarityBadge;