import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, Check, X, ShieldAlert } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  currentPin,
  onUpdatePin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    setErrorMsg('');
    if (isChangingPin) {
      if (newPinInput.length < 4) {
        setNewPinInput(prev => prev + digit);
      } else if (confirmPinInput.length < 4) {
        setConfirmPinInput(prev => prev + digit);
      }
      return;
    }

    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === currentPin) {
          onLoginSuccess();
          setPinInput('');
          setErrorMsg('');
          onClose();
        } else {
          setErrorMsg('PIN salah! Silakan coba lagi.');
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    if (isChangingPin) {
      if (confirmPinInput.length > 0) {
        setConfirmPinInput(prev => prev.slice(0, -1));
      } else {
        setNewPinInput(prev => prev.slice(0, -1));
      }
      return;
    }
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleSaveNewPin = () => {
    if (newPinInput.length !== 4) {
      setErrorMsg('PIN baru harus 4 digit!');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setErrorMsg('Konfirmasi PIN tidak cocok!');
      return;
    }
    onUpdatePin(newPinInput);
    setSuccessMsg('PIN berhasil diperbarui!');
    setTimeout(() => {
      setIsChangingPin(false);
      setNewPinInput('');
      setConfirmPinInput('');
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            setPinInput('');
            setErrorMsg('');
            setIsChangingPin(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header Icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#FFB900] to-amber-300 text-slate-950 shadow-md">
          {isAdmin ? <Unlock size={28} /> : <Lock size={28} />}
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          {isAdmin ? 'Mode Administrator Aktif' : 'Masuk Sebagai Admin'}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          {isAdmin
            ? 'Akses penuh terbuka untuk mencatat skor 30 poin, atur tim & jadwal.'
            : 'Masukkan 4 digit PIN admin (Bawaan: 1234)'}
        </p>

        {/* Changing PIN */}
        {isAdmin && isChangingPin ? (
          <div className="space-y-3 mb-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-700">PIN Baru (4 Digit):</label>
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl tracking-widest text-[#007DCC] focus:outline-none focus:border-[#007DCC]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Ulangi PIN Baru:</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-xl tracking-widest text-[#007DCC] focus:outline-none focus:border-[#007DCC]"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[#D10056] flex items-center gap-1 justify-center">
                <ShieldAlert size={14} /> {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 justify-center">
                <Check size={14} /> {successMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPin(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewPin}
                className="flex-1 py-2 text-xs font-bold bg-[#FFB900] text-slate-900 rounded-xl hover:bg-amber-400 transition"
              >
                Simpan PIN
              </button>
            </div>
          </div>
        ) : isAdmin ? (
          /* Admin Actions */
          <div className="space-y-3 mb-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#007DCC] flex items-center justify-center shrink-0">
                <Check size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#007DCC]">Hak Akses Penuh Terbuka</p>
                <p className="text-[11px] text-slate-500">Dapat mengontrol live score & kelola grup turnamen</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsChangingPin(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200"
              >
                <KeyRound size={15} /> Ganti PIN
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#D10056] border border-rose-200 text-xs font-semibold rounded-xl transition"
              >
                <Lock size={15} /> Keluar Admin
              </button>
            </div>
          </div>
        ) : (
          /* PIN Input Screen */
          <>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pinInput.length > idx
                      ? 'bg-[#007DCC] border-[#007DCC] scale-110 shadow-sm'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-[#D10056] mb-3 flex items-center justify-center gap-1 font-semibold">
                <ShieldAlert size={14} /> {errorMsg}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitClick(num)}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput('')}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
              >
                Hapus
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              PIN default: <strong className="text-[#007DCC]">1234</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
