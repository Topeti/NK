import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  TrendingDown,
  ChevronDown
} from 'lucide-react';

function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-gold-400/50 hover:bg-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-between gap-3 shadow-inner transition-all duration-200 cursor-pointer h-10"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.colorClass && (
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedOption.colorClass}`} />
          )}
          <span>{selectedOption ? selectedOption.label : label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 left-0 mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'text-black bg-gold-400 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.colorClass && (
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-black' : opt.colorClass}`} />
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isOpen]);

  return (
    <div className="relative w-full text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-border-dark hover:border-gold-400/50 focus:border-gold-400 px-4 py-3 rounded-xl text-sm text-white flex items-center justify-between gap-3 shadow-inner transition-all duration-200 cursor-pointer h-12"
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'text-black bg-gold-400 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Estoque({ inventory, setInventory }) {
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'Produtos', 'Descartáveis', 'Equipamentos'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'green', 'yellow', 'red'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for stock inputs
  const [addQtyInputs, setAddQtyInputs] = useState({}); // itemId -> number string

  // Add Product Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddRender, setIsAddRender] = useState(false);
  const [isAddExiting, setIsAddExiting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Produtos',
    currentQuantity: 0,
    minimumQuantity: 5
  });

  // Remove Product Modal State
  const [productToRemove, setProductToRemove] = useState(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isRemoveRender, setIsRemoveRender] = useState(false);
  const [isRemoveExiting, setIsRemoveExiting] = useState(false);

  // Handle Add Modal open/close animation
  useEffect(() => {
    if (isAddOpen) {
      setIsAddRender(true);
      setIsAddExiting(false);
    } else if (isAddRender) {
      setIsAddExiting(true);
      const timer = setTimeout(() => {
        setIsAddRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isAddOpen, isAddRender]);

  // Handle Remove Modal open/close animation
  useEffect(() => {
    if (isRemoveOpen) {
      setIsRemoveRender(true);
      setIsRemoveExiting(false);
    } else if (isRemoveRender) {
      setIsRemoveExiting(true);
      const timer = setTimeout(() => {
        setIsRemoveRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isRemoveOpen, isRemoveRender]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const createdItem = {
      id: Date.now(),
      name: newProduct.name.trim(),
      category: newProduct.category,
      currentQuantity: Number(newProduct.currentQuantity) || 0,
      minimumQuantity: Number(newProduct.minimumQuantity) || 0
    };

    setInventory(prev => [...prev, createdItem]);
    setNewProduct({
      name: '',
      category: 'Produtos',
      currentQuantity: 0,
      minimumQuantity: 5
    });
    setIsAddOpen(false);
  };

  const handleInitiateRemove = (item) => {
    setProductToRemove(item);
    setIsRemoveOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!productToRemove) return;
    setInventory(prev => prev.filter(item => item.id !== productToRemove.id));
    setIsRemoveOpen(false);
    setProductToRemove(null);
  };

  const getStockStatus = (current, min) => {
    if (current < min) return 'red';
    if (current === min) return 'yellow';
    return 'green';
  };

  const getStatusLabelAndColor = (current, min) => {
    if (current < min) {
      return { label: 'Abaixo do Mínimo', textClass: 'text-red-400 bg-red-500/10 border-red-500/30', indicator: 'bg-red-500' };
    }
    if (current === min) {
      return { label: 'No Limite', textClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30', indicator: 'bg-yellow-500' };
    }
    return { label: 'Em Dia', textClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', indicator: 'bg-emerald-500' };
  };

  const handleAddStock = (itemId) => {
    const qtyToAdd = parseInt(addQtyInputs[itemId]);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) return;

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          currentQuantity: item.currentQuantity + qtyToAdd
        };
      }
      return item;
    }));

    // Clear input
    setAddQtyInputs(prev => ({ ...prev, [itemId]: '' }));
  };

  // Filter products
  const filteredInventory = inventory.filter(item => {
    const status = getStockStatus(item.currentQuantity, item.minimumQuantity);
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Row with Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            Estoque
          </h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Controle de produtos, consumíveis e equipamentos
          </p>
        </div>
        
        {/* Add Product Button */}
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-gold-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 btn-primary self-start md:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card-bg border border-border-dark p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end w-full">
          
          {/* Search bar */}
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <span className="text-[10px] text-[#9ca3af] font-black uppercase tracking-wider select-none">
              Buscar Produto
            </span>
            <div className="relative w-full">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-border-dark hover:border-gold-400/50 focus:border-gold-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white input-premium placeholder-gray-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full md:w-auto">
            
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5 w-full sm:w-48">
              <span className="text-[10px] text-[#9ca3af] font-black uppercase tracking-wider select-none">
                Categoria
              </span>
              <FilterDropdown
                label="Categoria"
                options={[
                  { id: 'all', label: 'Todas Categorias' },
                  { id: 'Produtos', label: 'Produtos' },
                  { id: 'Descartáveis', label: 'Descartáveis' },
                  { id: 'Equipamentos', label: 'Equipamentos' }
                ]}
                value={filterCategory}
                onChange={setFilterCategory}
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5 w-full sm:w-48">
              <span className="text-[10px] text-[#9ca3af] font-black uppercase tracking-wider select-none">
                Status
              </span>
              <FilterDropdown
                label="Status"
                options={[
                  { id: 'all', label: 'Todos Status' },
                  { id: 'green', label: 'Em Dia (Verde)', colorClass: 'bg-emerald-500' },
                  { id: 'yellow', label: 'No Limite (Amarelo)', colorClass: 'bg-yellow-500' },
                  { id: 'red', label: 'Abaixo do Mínimo (Vermelho)', colorClass: 'bg-red-500' }
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
              />
            </div>

            {/* Clear Filters Button */}
            {(filterCategory !== 'all' || filterStatus !== 'all') && (
              <div className="flex items-center justify-start sm:justify-center h-10 sm:h-10 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="text-xs font-bold text-[#D4A843] hover:text-gold-300 transition-colors uppercase tracking-wider cursor-pointer border-0 bg-transparent p-0 outline-none"
                >
                  Limpar filtros
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Critical Stock Alert Bar */}
      {inventory.some(item => item.currentQuantity < item.minimumQuantity) && (
        <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-xl flex gap-3 items-center">
          <TrendingDown className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white">Alerta de Reposição: </span>
            <span className="text-gray-400">
              Existem itens com estoque abaixo do limite mínimo recomendado. Veja os itens sinalizados em vermelho.
            </span>
          </div>
        </div>
      )}

      {/* Grid of Compact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredInventory.map((item) => {
          const statusInfo = getStatusLabelAndColor(item.currentQuantity, item.minimumQuantity);
          const inputVal = addQtyInputs[item.id] || '';

          return (
            <div 
              key={item.id} 
              className="bg-card-bg border border-border-dark p-4 rounded-xl flex flex-col justify-between card-premium group"
            >
              <div>
                {/* Header Card */}
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider truncate">
                    {item.category}
                  </span>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Indicator Badge */}
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full uppercase border shrink-0 ${statusInfo.textClass}`}>
                      {statusInfo.label}
                    </span>
                    
                    {/* Premium Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiateRemove(item)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-inner shrink-0"
                      title="Excluir Produto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <h5 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors duration-200 truncate" title={item.name}>
                  {item.name}
                </h5>

                {/* Quantities Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Estoque Atual:</span>
                    <span className="font-bold text-white">{item.currentQuantity} unidades</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Estoque Mínimo:</span>
                    <span>{item.minimumQuantity} unidades</span>
                  </div>

                  {/* Quantity bar viz */}
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full ${
                        item.currentQuantity < item.minimumQuantity 
                          ? 'bg-red-500' 
                          : item.currentQuantity === item.minimumQuantity
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.currentQuantity / (item.minimumQuantity || 1)) * 50)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Restock Form */}
              <div className="mt-5 pt-3 border-t border-border-dark flex flex-row flex-nowrap gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd"
                  value={inputVal}
                  onChange={(e) => setAddQtyInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                  className="w-16 h-10 bg-black/40 border border-border-dark rounded-xl px-2 text-xs text-center text-white input-premium placeholder-gray-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddStock(item.id)}
                  disabled={!inputVal || parseInt(inputVal) <= 0}
                  className="flex-1 h-10 bg-gold-400/10 text-gold-400 border border-gold-400/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 btn-secondary disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 whitespace-nowrap shrink-0" />
                  <span className="whitespace-nowrap">Registrar Entrada</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12 bg-card-bg border border-border-dark rounded-2xl">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Nenhum item encontrado com os filtros selecionados.</p>
        </div>
      )}

      {/* MODAL: Novo Produto */}
      {isAddRender && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
              isAddExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
            }`} 
            onClick={() => setIsAddOpen(false)}
          ></div>
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${
            isAddExiting ? 'animate-modal-out' : 'animate-modal-in'
          }`}>
            <form onSubmit={handleAddProduct} className="flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Novo Item no Estoque</h3>
                  <p className="text-xs text-gray-400 mt-1">Registre um novo produto, descarte ou equipamento.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                
                {/* Product Name Input */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="text"
                    required
                    id="prodName"
                    placeholder="Ex: Cera Modeladora Strong"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer text-left"
                  />
                  <label htmlFor="prodName" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Nome do Item</label>
                </div>

                {/* Category Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
                  <FormDropdown
                    label="Categoria"
                    options={[
                      { id: 'Produtos', label: 'Produtos' },
                      { id: 'Descartáveis', label: 'Descartáveis' },
                      { id: 'Equipamentos', label: 'Equipamentos' }
                    ]}
                    value={newProduct.category}
                    onChange={(val) => setNewProduct(prev => ({ ...prev, category: val }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Current Quantity Input */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="number"
                      required
                      min={0}
                      id="prodQty"
                      placeholder="Ex: 10"
                      value={newProduct.currentQuantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, currentQuantity: e.target.value }))}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer text-left"
                    />
                    <label htmlFor="prodQty" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Estoque Inicial</label>
                  </div>

                  {/* Minimum Quantity Input */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="number"
                      required
                      min={0}
                      id="prodMin"
                      placeholder="Ex: 5"
                      value={newProduct.minimumQuantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, minimumQuantity: e.target.value }))}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer text-left"
                    />
                    <label htmlFor="prodMin" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Estoque Mínimo</label>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-xs font-bold btn-primary cursor-pointer hover:bg-gold-500 transition-colors h-11"
                >
                  Confirmar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Produto (Confirmação) */}
      {isRemoveRender && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
              isRemoveExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
            }`} 
            onClick={() => setIsRemoveOpen(false)}
          ></div>
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${
            isRemoveExiting ? 'animate-modal-out' : 'animate-modal-in'
          }`}>
            
            <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider text-left">Remover do Estoque</h3>
                  <p className="text-xs text-gray-400 mt-1 text-left">Excluir item do catálogo.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsRemoveOpen(false)}
                className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <p className="text-sm text-gray-300">
                Tem certeza que deseja excluir o item <strong>{productToRemove?.name}</strong> do estoque?
              </p>
              <p className="text-xs text-gray-500 leading-normal">
                Esta ação removerá permanentemente o produto do seu inventário e dos relatórios de alertas críticos de reposição.
              </p>
            </div>

            <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRemoveOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
              >
                Manter Item
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-bold btn-danger cursor-pointer hover:bg-red-700 transition-colors h-11"
              >
                Excluir Definitivamente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
