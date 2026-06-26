import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function Estoque({ inventory, setInventory }) {
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'Produtos', 'Descartáveis', 'Equipamentos'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'green', 'yellow', 'red'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for stock inputs
  const [addQtyInputs, setAddQtyInputs] = useState({}); // itemId -> number string

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
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Controle de produtos, consumíveis e equipamentos
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-white input-premium placeholder-gray-600"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Categoria:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black/40 border border-border-dark rounded-xl px-3 py-2 text-xs text-white input-premium"
              >
                <option value="all">Todas Categorias</option>
                <option value="Produtos">Produtos</option>
                <option value="Descartáveis">Descartáveis</option>
                <option value="Equipamentos">Equipamentos</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-black/40 border border-border-dark rounded-xl px-3 py-2 text-xs text-white input-premium"
              >
                <option value="all">Todos Status</option>
                <option value="green">Em Dia (Verde)</option>
                <option value="yellow">No Limite (Amarelo)</option>
                <option value="red">Abaixo do Mínimo (Vermelho)</option>
              </select>
            </div>

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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                    {item.category}
                  </span>
                  
                  {/* Status Indicator Badge */}
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${statusInfo.textClass}`}>
                    {statusInfo.label}
                  </span>
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
              <div className="mt-5 pt-3 border-t border-border-dark flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd"
                  value={inputVal}
                  onChange={(e) => setAddQtyInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                  className="w-16 bg-black/40 border border-border-dark rounded-lg px-2 py-1.5 text-xs text-center text-white input-premium placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => handleAddStock(item.id)}
                  disabled={!inputVal || parseInt(inputVal) <= 0}
                  className="flex-1 bg-gold-400/10 text-gold-400 border border-gold-400/20 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 btn-secondary disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Entrada</span>
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

    </div>
  );
}
