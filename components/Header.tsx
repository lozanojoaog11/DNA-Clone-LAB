
import React from 'react';
import { DnaIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                <DnaIcon className="w-10 h-10 text-cyan-400" />
                <h1 className="text-3xl md:text-4xl font-bold font-display tracking-wider text-cyan-300">
                    SISTEMA DE CLONAGEM MENTAL <span className="text-white">DNA™</span>
                </h1>
            </div>
            <p className="mt-2 text-sm text-gray-400">Blueprint Técnico Completo para Automação Cognitiva</p>
        </header>
    );
};

export default Header;
