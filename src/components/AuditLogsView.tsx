import React from 'react';
import { AuditLog, UserProfile } from '../types';
import { ShieldAlert, Key, Lock, DollarSign, Activity, Terminal } from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  users: UserProfile[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, users }) => {
  const getUserName = (clerkId: string) => {
    const u = users.find(user => user.clerkUserId === clerkId || user._id === clerkId);
    return u ? `${u.firstName} ${u.lastName}` : clerkId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            Journal d'Audit Security & Traçabilité
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Traçabilité inviolable des accès serrures domotiques, virements sous séquestre & modifications sensibles.
          </p>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Audit Trail Live - Synchronisé localement Dexie.js</span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({log.targetEntityType}: {log.targetEntityId})</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Acteur: <span className="text-slate-200 font-semibold">{getUserName(log.actorClerkId)}</span>
                  </p>
                  {log.metadata && (
                    <div className="mt-1 font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-slate-500 font-mono text-[11px]">
                <p>{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                <p>IP: {log.ipAddress || '127.0.0.1'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
