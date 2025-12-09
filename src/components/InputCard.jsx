import React from 'react';

const InputCard = ({ title, icon: Icon, children }) => (
    <div className="glass-card p-6 rounded-4xl transition-all duration-300 hover:scale-102 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 pb-2 flex items-center border-b border-white/10" style={{ textShadow: '0 0 10px rgba(255, 77, 0, 0.5)' }}>
            {Icon && <Icon className="w-6 h-6 mr-3" />}
            {title}
        </h2>
        {children}
    </div>
);

export default InputCard;

