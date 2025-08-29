
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, isMenuOpen, onMenuToggle }) => {
    return (
        <header className="flex justify-between items-center p-4 h-20">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">侍</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">Sudoku Samurai</h1>
            </div>

            <button
                onClick={onMenuToggle}
                className={`p-3 rounded-full transition-colors z-50 ${theme.button}`}
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </header>
    );
};

export default Header;
