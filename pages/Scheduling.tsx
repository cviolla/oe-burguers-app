
import React, { useState } from 'react';
import { ScheduledTime } from '../types';

interface SchedulingProps {
  onBack: () => void;
  onConfirm: (time: ScheduledTime) => void;
}

const Scheduling: React.FC<SchedulingProps> = ({ onBack, onConfirm }) => {
  const timeSlots = [
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
    '00:00', '00:30'
  ];

  const [selectedTime, setSelectedTime] = useState('19:30');

  const handleConfirm = () => {
    onConfirm({
      date: 'Hoje',
      time: selectedTime
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5 bg-dark-bg/95 backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </button>
        <div>
          <h1 className="text-xl font-black">Horário de Retirada</h1>
          <p className="text-[10px] text-dark-text-secondary uppercase tracking-widest font-bold">escolha o horário</p>
        </div>
      </header>

      <main className="p-6 flex-1 space-y-10">
        {/* Time Slots Grid */}
        <section>
          <h2 className="text-base font-bold text-white mb-6">Selecione o Horário</h2>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`py-4 rounded-2xl border text-sm font-bold transition-all ${selectedTime === slot
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-dark-card border-white/5 text-dark-text-secondary hover:border-white/20'
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <p className="mt-8 text-center text-[10px] text-dark-text-secondary leading-relaxed px-10">
            * O horário selecionado garante prioridade na fila de produção.
          </p>
        </section>
      </main>

      <footer className="p-6 bg-dark-bg/95 backdrop-blur-md border-t border-white/5 sticky bottom-0">
        <div className="mb-6 flex items-center justify-between bg-dark-card p-4 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-icons-round">alarm</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-dark-text-secondary tracking-widest">Retirada em Loja</p>
              <p className="text-sm font-bold text-white">Retirada às {selectedTime}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>Confirmar Retirada</span>
          <span className="material-icons-round">check_circle</span>
        </button>
      </footer>
    </div>
  );
};

export default Scheduling;
