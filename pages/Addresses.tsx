
import React, { useState } from 'react';
import { Address } from '../types';

interface AddressesProps {
  onBack: () => void;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  deliveryFees: any[];
  showAlert?: (title: string, message: string, icon?: string) => void;
  showConfirm?: (title: string, message: string, confirmText?: string, cancelText?: string, icon?: string) => Promise<boolean>;
}


const Addresses: React.FC<AddressesProps> = ({ onBack, addresses, setAddresses, deliveryFees, showAlert, showConfirm }) => {


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [complement, setComplement] = useState('');

  const openAddForm = () => {
    setEditingAddress(null);
    setLabel('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setComplement('');
    setIsFormOpen(true);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setLabel(address.label);
    setStreet(address.street);
    setNumber(address.number);
    setNeighborhood(address.neighborhood);
    setComplement(address.complement || '');
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!label || !street || !number) return;

    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? {
        ...a, label, street, number, neighborhood, complement
      } : a));
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        label, street, number, neighborhood, city, complement,
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    const addressToDelete = addresses.find(a => a.id === id);
    if (!addressToDelete) return;

    const confirmed = await showConfirm?.(
      'Excluir Endereço',
      `Tem certeza que deseja excluir o endereço "${addressToDelete.label}"?`,
      'Excluir',
      'Manter',
      'delete_outline'
    );

    if (confirmed) {
      setAddresses(prev => {
        const filtered = prev.filter(a => a.id !== id);
        if (addressToDelete.isDefault && filtered.length > 0) {
          return filtered.map((a, i) => i === 0 ? { ...a, isDefault: true } : a);
        }
        return filtered;
      });
    }
  };

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-dark-bg/95 backdrop-blur-md z-40 border-b border-white/5">
        <button
          onClick={isFormOpen ? () => setIsFormOpen(false) : onBack}
          className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all"
        >
          <span className="material-icons-round">
            {isFormOpen ? 'close' : 'arrow_back_ios_new'}
          </span>
        </button>
        <div>
          <h1 className="text-xl font-black">{isFormOpen ? (editingAddress ? 'Editar Endereço' : 'Novo Endereço') : 'Meus Endereços'}</h1>
          <p className="text-[10px] text-dark-text-secondary uppercase tracking-widest font-bold">
            {isFormOpen ? 'Preencha os dados abaixo' : 'Gerencie seus locais de entrega'}
          </p>
        </div>
      </header>

      <main className="p-6">
        {isFormOpen ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Apelido (ex: Casa, Trabalho)</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-secondary text-lg">label</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-dark-card border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ex: Minha Casa"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Rua/Avenida</label>

                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-dark-card border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ex: Avenida Paulista"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Nº</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-dark-card border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                list="neighborhoods-list"
                onChange={(e) => setNeighborhood(e.target.value)}
                onFocus={(e) => e.target.setAttribute('list', 'neighborhoods-list')}
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = '';
                  setNeighborhood('');
                }}
                className="w-full bg-dark-card border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Clique para ver bairros"
              />
              <datalist id="neighborhoods-list">
                {(deliveryFees || []).filter(f => f.is_active).map(fee => (
                  <option key={fee.id} value={fee.neighborhood} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark-text-secondary uppercase tracking-[0.2em] ml-1">Complemento (Opcional)</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="w-full bg-dark-card border-white/5 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Apto, Bloco, Referência..."
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
            >
              Salvar Endereço
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-dark-card rounded-3xl p-5 border transition-all ${addr.isDefault ? 'border-primary/50 bg-primary/5 shadow-primary/10' : 'border-white/5 shadow-xl'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white' : 'bg-white/5 text-dark-text-secondary'}`}>
                      <span className="material-icons-round">
                        {addr.label.toLowerCase().includes('casa') ? 'home' :
                          addr.label.toLowerCase().includes('trabalho') ? 'work' : 'place'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{addr.label}</h4>
                        {addr.isDefault && <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Padrão</span>}
                      </div>
                      <p className="text-[11px] text-dark-text-secondary mt-1">
                        {addr.street}, {addr.number} {addr.complement && `• ${addr.complement}`}
                      </p>
                      <p className="text-[10px] text-dark-text-secondary opacity-60">
                        {addr.neighborhood}, {addr.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-white/5 pt-4">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="flex-1 bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex-1 bg-rose-500/10 text-rose-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">delete</span>
                    Excluir
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="px-4 bg-primary/10 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                      title="Definir como Padrão"
                    >
                      <span className="material-icons-round text-sm">check</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={openAddForm}
              className="w-full border-2 border-dashed border-white/10 py-6 rounded-3xl flex flex-col items-center justify-center text-dark-text-secondary hover:border-primary/50 hover:text-primary transition-all group"
            >
              <span className="material-icons-round text-3xl mb-2 group-hover:scale-110 transition-transform">add_location_alt</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Novo Endereço</span>
            </button>
          </div>
        )}
      </main>

      {!isFormOpen && (
        <footer className="mt-10 px-6 pb-12 text-center">
          <p className="text-[8px] text-dark-text-secondary uppercase tracking-[0.4em] font-bold opacity-30">OE BURGUERS • MEUS LOCAIS</p>
        </footer>
      )}
    </div>
  );
};

export default Addresses;
