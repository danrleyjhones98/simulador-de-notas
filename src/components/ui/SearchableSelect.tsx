import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right';
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  className = '',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filtragem inteligente de opções
  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const matchLabel = opt.label.toLowerCase().includes(term);
    const matchSublabel = opt.sublabel?.toLowerCase().includes(term);
    const matchBadge = opt.badge?.toLowerCase().includes(term);
    return matchLabel || matchSublabel || matchBadge;
  });

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: any) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botão Trigger (Coss UI style) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#16161a] hover:bg-[#1f1f24] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-medium text-left flex items-center justify-between gap-2 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/80 shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-blue-500/40 border-blue-500/80' : ''}`}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-zinc-100 truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                  selectedOption.badgeColor || 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {selectedOption.badge}
                </span>
              )}
              {selectedOption.sublabel && (
                <span className="text-[11px] text-zinc-400 truncate shrink-0">
                  {selectedOption.sublabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown (Coss UI / Cal.com styling) */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-full min-w-[240px] max-w-[480px] bg-[#121215] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ maxHeight: '320px' }}
        >
          {/* Barra de Pesquisa Fixa */}
          <div className="p-2 border-b border-[#27272a] bg-[#16161a]/90 flex items-center gap-2 sticky top-0 z-10">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none w-full font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
                if (e.key === 'Enter' && filteredOptions.length > 0) {
                  handleSelect(filteredOptions[0].value);
                }
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-zinc-400 hover:text-zinc-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Lista de Opções Rolável com Scrollbar Coss */}
          <div className="p-1 max-h-60 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-zinc-500">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition duration-100 ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-zinc-300 hover:bg-[#1e1e24] hover:text-white'
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                              opt.badgeColor || 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
