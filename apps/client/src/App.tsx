import React from "react";

export function App() {
  return (
    <main className="min-h-screen max-w-md mx-auto p-6 flex flex-col justify-center">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Status do Veículo</h1>
        <p className="text-sm text-neutral-400">Insira a placa para acompanhar a sua ordem de serviço em tempo real.</p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ex: ABC1D23"
            maxLength={8}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-4 py-2 text-center uppercase tracking-widest text-white focus:outline-none focus:border-neutral-500"
          />
          <button className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-neutral-200 transition-colors">
            Consultar
          </button>
        </div>
      </div>
    </main>
  );
}
