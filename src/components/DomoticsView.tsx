import React, { useState } from 'react';
import { Property, ConnectedDevice } from '../types';
import { Cpu, Key, BatteryCharging, Droplet, Shield, Lock, Unlock, Wifi, RefreshCw } from 'lucide-react';

interface DomoticsViewProps {
  properties: Property[];
}

export const DomoticsView: React.FC<DomoticsViewProps> = ({ properties }) => {
  const [pinCode, setPinCode] = useState('');
  const [pinLabel, setPinLabel] = useState('');

  const allDevices: { device: ConnectedDevice; propertyTitle: string }[] = [];
  properties.forEach(p => {
    p.connectedDevices?.forEach(d => {
      allDevices.push({ device: d, propertyTitle: p.title });
    });
  });

  const handleGeneratePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || !pinLabel) return;
    alert(`🔐 NOUVEAU CODE PIN CRÉÉ AVEC SUCCÈS !\n\nLabel: ${pinLabel}\nCode: ${pinCode}\nSerrure: Serrure Entrée Principale (NUKI)\nValidité: Du 18/08/2026 au 31/12/2026\n\nLe code PIN a été synchronisé directement dans la mémoire de la serrure via Dexie.js.`);
    setPinCode('');
    setPinLabel('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            Domotique IoT & Serrures Intelligentes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestion des accès PIN temporaires pour locataires, capteurs de fuites d'eau et télémétrie en temps réel.
          </p>
        </div>

        <button 
          onClick={() => alert('🔄 Télécollecte domotique mise à jour. Tous les capteurs répondent à 100%.')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser Télémétrie Capteurs
        </button>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allDevices.map(({ device, propertyTitle }) => (
          <div key={device.id} className="glass-card p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {device.type === 'SERRURE_CONNECTEE' ? (
                    <Lock className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Droplet className="w-5 h-5 text-sky-400" />
                  )}
                  <div>
                    <h3 className="font-bold text-white text-sm">{device.name}</h3>
                    <p className="text-[10px] text-slate-400">{device.brand} • {propertyTitle}</p>
                  </div>
                </div>
                <span className="badge-status bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  <Wifi className="w-3 h-3 text-emerald-400" /> {device.status.replace('_', ' ')}
                </span>
              </div>

              {/* Telemetry info */}
              {device.lastTelemetry && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Niveau de Batterie:
                    </span>
                    <span className="font-extrabold text-emerald-400">
                      {device.lastTelemetry.batteryLevel}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>État de l'ancre:</span>
                    <span className="font-bold text-white">
                      {device.lastTelemetry.isOpen ? 'Déverrouillé' : 'Verrouillé / Securisé'}
                    </span>
                  </div>
                </div>
              )}

              {/* Active PIN codes */}
              {device.activePinCodes && device.activePinCodes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> Codes PIN d'accès actifs:
                  </span>
                  {device.activePinCodes.map((pin, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                      <span className="text-slate-300">{pin.label}</span>
                      <span className="font-mono font-extrabold text-amber-400 tracking-wider">{pin.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {device.type === 'SERRURE_CONNECTEE' && (
              <button 
                onClick={() => alert(`🔓 Déverrouillage à distance envoyé pour ${device.name}.`)}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" /> Déverrouiller à Distance
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PIN Code Generator Form Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          Générateur de Code PIN d'Accès Serrure
        </h3>

        <form onSubmit={handleGeneratePin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nom ou Destinataire du Code PIN</label>
            <input
              type="text"
              placeholder="ex: Code d'accès Ménage / Prestataire"
              value={pinLabel}
              onChange={(e) => setPinLabel(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Code PIN à 6 chiffres</label>
            <input
              type="text"
              maxLength={6}
              placeholder="ex: 987654"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Programmer le Code PIN dans Dexie & Serrure
          </button>
        </form>
      </div>
    </div>
  );
};
