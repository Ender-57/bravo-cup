import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, KeyRound, Check, X, ShieldAlert, 
  Eye, EyeOff, ShieldCheck, Clock, AlertTriangle, CheckCircle2 
} from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
  initialMode?: 'login' | 'changePin';
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 Menit
const STORAGE_KEY_ATTEMPTS = 'badminton_admin_pin_failed_attempts';
const STORAGE_KEY_LOCKOUT = 'badminton_admin_pin_locked_until';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  currentPin,
  onUpdatePin,
  initialMode = 'login',
}) => {
  // Tab state: 'login' | 'changePin'
  const [activeTab, setActiveTab] = useState<'login' | 'changePin'>(initialMode);

  // Login inputs
  const [pinInput, setPinInput] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Change PIN inputs
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [activePinField, setActivePinField] = useState<'old' | 'new' | 'confirm'>('new');

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Security: Failed attempts & 30-minute Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOCKOUT);
    if (!saved) return null;
    const time = parseInt(saved, 10);
    return time > Date.now() ? time : null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Check and run countdown timer every second if locked
  useEffect(() => {
    const updateLockState = () => {
      const savedLock = localStorage.getItem(STORAGE_KEY_LOCKOUT);
      if (savedLock) {
        const time = parseInt(savedLock, 10);
        const now = Date.now();
        if (time > now) {
          setLockedUntil(time);
          setRemainingSeconds(Math.ceil((time - now) / 1000));
          return;
        }
      }
      // Lock expired or not set
      setLockedUntil(null);
      setRemainingSeconds(0);
      localStorage.removeItem(STORAGE_KEY_LOCKOUT);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      setFailedAttempts(0);
    };

    updateLockState();
    const interval = setInterval(updateLockState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setPinInput('');
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setErrorMsg('');
      setSuccessMsg('');
      setActivePinField(isAdmin ? 'new' : 'old');

      // Refresh lock state
      const savedLock = localStorage.getItem(STORAGE_KEY_LOCKOUT);
      if (savedLock) {
        const time = parseInt(savedLock, 10);
        const now = Date.now();
        if (time > now) {
          setLockedUntil(time);
          setRemainingSeconds(Math.ceil((time - now) / 1000));
        } else {
          setLockedUntil(null);
          localStorage.removeItem(STORAGE_KEY_LOCKOUT);
          localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
          setFailedAttempts(0);
        }
      }
    }
  }, [isOpen, initialMode, isAdmin]);

  if (!isOpen) return null;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  // Format countdown mm:ss
  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Record a failed attempt
  const handleRecordFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(nextAttempts));

    if (nextAttempts >= MAX_ATTEMPTS) {
      const lockExpiry = Date.now() + LOCKOUT_DURATION_MS;
      setLockedUntil(lockExpiry);
      localStorage.setItem(STORAGE_KEY_LOCKOUT, String(lockExpiry));
      setRemainingSeconds(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      setErrorMsg(`PIN salah 3 kali! Akses login dikunci selama 30 menit.`);
    } else {
      const remaining = MAX_ATTEMPTS - nextAttempts;
      setErrorMsg(`PIN salah! Sisa percobaan: ${remaining} kali sebelum terkunci 30 menit.`);
    }
  };

  // Reset failed attempts on success
  const handleResetLock = () => {
    setFailedAttempts(0);
    setLockedUntil(null);
    setRemainingSeconds(0);
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEY_LOCKOUT);
  };

  // Keypad click handler for both modes
  const handleDigitClick = (digit: string) => {
    if (isLocked) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'changePin') {
      if (activePinField === 'old') {
        if (oldPinInput.length < 4) {
          const next = oldPinInput + digit;
          setOldPinInput(next);
          if (next.length === 4) setActivePinField('new');
        }
      } else if (activePinField === 'new') {
        if (newPinInput.length < 4) {
          const next = newPinInput + digit;
          setNewPinInput(next);
          if (next.length === 4) setActivePinField('confirm');
        }
      } else if (activePinField === 'confirm') {
        if (confirmPinInput.length < 4) {
          setConfirmPinInput(prev => prev + digit);
        }
      }
      return;
    }

    // Login mode
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === currentPin) {
          handleResetLock();
          onLoginSuccess();
          setPinInput('');
          setErrorMsg('');
          onClose();
        } else {
          handleRecordFailedAttempt();
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isLocked) return;
    setErrorMsg('');
    if (activeTab === 'changePin') {
      if (activePinField === 'confirm' && confirmPinInput.length > 0) {
        setConfirmPinInput(prev => prev.slice(0, -1));
      } else if (activePinField === 'confirm' && confirmPinInput.length === 0) {
        setActivePinField('new');
      } else if (activePinField === 'new' && newPinInput.length > 0) {
        setNewPinInput(prev => prev.slice(0, -1));
      } else if (activePinField === 'new' && newPinInput.length === 0 && !isAdmin) {
        setActivePinField('old');
      } else if (activePinField === 'old') {
        setOldPinInput(prev => prev.slice(0, -1));
      }
      return;
    }

    setPinInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isLocked) return;
    setErrorMsg('');
    if (activeTab === 'changePin') {
      if (activePinField === 'old') setOldPinInput('');
      else if (activePinField === 'new') setNewPinInput('');
      else if (activePinField === 'confirm') setConfirmPinInput('');
      return;
    }
    setPinInput('');
  };

  const handleSaveNewPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLocked) return;
    setErrorMsg('');

    // Check old PIN if not already admin
    if (!isAdmin) {
      if (oldPinInput.length !== 4) {
        setErrorMsg('Masukkan 4 digit PIN lama!');
        setActivePinField('old');
        return;
      }
      if (oldPinInput !== currentPin) {
        handleRecordFailedAttempt();
        setActivePinField('old');
        return;
      }
    }

    if (newPinInput.length !== 4) {
      setErrorMsg('PIN baru harus tepat 4 digit angka!');
      setActivePinField('new');
      return;
    }

    if (confirmPinInput.length !== 4) {
      setErrorMsg('Masukkan konfirmasi 4 digit PIN baru!');
      setActivePinField('confirm');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok!');
      setActivePinField('confirm');
      return;
    }

    // Success save
    handleResetLock();
    onUpdatePin(newPinInput);
    onLoginSuccess(); // Auto login as admin
    setSuccessMsg(`PIN berhasil diubah ke: ${newPinInput}`);

    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-center text-slate-800 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        {/* --- SECURITY LOCKOUT SCREEN (30 MINUTES) --- */}
        {isLocked ? (
          <div className="py-2 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-rose-100 text-[#D10056] border-2 border-rose-300 shadow-lg shadow-rose-500/20 animate-pulse">
              <ShieldAlert size={34} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-[#D10056] border border-rose-300 mb-2">
                Akses Terkunci Sementara
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Terlalu Banyak Percobaan PIN
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Salah memasukkan PIN sebanyak <strong className="text-slate-800">3 kali</strong>. Demi keamanan turnamen, akses login ditangguhkan selama <strong className="text-slate-800">30 menit</strong>.
              </p>
            </div>

            {/* Live Digital Countdown */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-rose-500 shadow-inner text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <Clock size={12} className="text-[#FFB900]" />
                <span>Waktu Tunggu Tersisa:</span>
              </p>
              <div className="font-['Teko',sans-serif] text-5xl font-black tracking-widest text-[#FFB900]">
                {formatCountdown(remainingSeconds)}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {Math.ceil(remainingSeconds / 60)} menit lagi sebelum Anda dapat mencoba PIN kembali
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
              <span>
                Jika Anda lupa PIN, harap hubungi panitia administrator turnamen. Tombol input akan terbuka otomatis setelah waktu habis.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Tutup Jendela
            </button>
          </div>
        ) : (
          /* --- NORMAL / UNLOCKED SCREEN --- */
          <>
            {/* Modal Top Icon */}
            <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-md ${
              isAdmin
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                : 'bg-gradient-to-tr from-[#FFB900] to-amber-300 text-slate-950'
            }`}>
              {activeTab === 'changePin' ? (
                <KeyRound size={28} />
              ) : isAdmin ? (
                <Unlock size={28} />
              ) : (
                <Lock size={28} />
              )}
            </div>

            {/* Tab Switcher: Masuk vs Ganti PIN */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck size={14} />
                <span>{isAdmin ? 'Status Admin' : 'Masuk Admin'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('changePin');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setActivePinField(isAdmin ? 'new' : 'old');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'changePin'
                    ? 'bg-[#007DCC] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound size={14} />
                <span>Ganti PIN</span>
              </button>
            </div>

            {/* TAB 1: LOGIN / ADMIN STATUS */}
            {activeTab === 'login' && (
              <>
                {isAdmin ? (
                  /* Already Logged In Admin View */
                  <div className="space-y-3 mb-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Mode Wasit / Admin Aktif
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hak akses penuh terbuka untuk mencatat live score 30 poin, atur tim & jadwal turnamen.
                    </p>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Tersambung Sebagai Administrator</p>
                        <p className="text-[11px] text-slate-500">PIN saat ini: <strong className="text-slate-800">{currentPin}</strong></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('changePin');
                          setActivePinField('new');
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#007DCC] hover:bg-[#006bb0] text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        <KeyRound size={14} /> Ganti PIN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#D10056] border border-rose-200 text-xs font-bold rounded-xl transition"
                      >
                        <Lock size={14} /> Keluar Admin
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PIN Input Pad */
                  <>
                    <h3 className="text-lg font-black text-slate-900 mb-1">
                      Masukkan PIN Admin
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Masukkan 4 digit PIN admin
                    </p>

                    {/* Attempt Warning Notice if there are previous failed attempts */}
                    {failedAttempts > 0 && (
                      <div className="mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1.5">
                        <AlertTriangle size={13} className="text-amber-600" />
                        <span>
                          Percobaan {failedAttempts} dari {MAX_ATTEMPTS}: Sisa {MAX_ATTEMPTS - failedAttempts} kali sebelum terkunci 30 menit.
                        </span>
                      </div>
                    )}

                    {/* 4 Digit Indicators */}
                    <div className="flex justify-center items-center gap-3 mb-4">
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
                      <button
                        type="button"
                        onClick={() => setShowLoginPin(!showLoginPin)}
                        className="ml-1 p-1 text-slate-400 hover:text-slate-700"
                        title={showLoginPin ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showLoginPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {showLoginPin && pinInput && (
                      <p className="text-xs font-mono font-bold text-[#007DCC] mb-2 tracking-widest">
                        {pinInput}
                      </p>
                    )}

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
                          className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleClear}
                        className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDigitClick('0')}
                        className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>Maks. 3 kali salah</span>
                      <span>Kunci: 30 Menit</span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: GANTI PIN ADMIN */}
            {activeTab === 'changePin' && (
              <form onSubmit={handleSaveNewPin} className="space-y-3 text-left">
                <div className="text-center mb-1">
                  <h3 className="text-base font-black text-slate-900">
                    Ubah PIN Administrator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gunakan 4 digit angka baru untuk keamanan akses turnamen
                  </p>
                </div>

                {/* Attempt Warning Notice if there are failed attempts */}
                {failedAttempts > 0 && !isAdmin && (
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                    <span>
                      Sisa kesempatan verifikasi PIN lama: {MAX_ATTEMPTS - failedAttempts} kali.
                    </span>
                  </div>
                )}

                {/* Field: PIN Lama (hanya jika belum login admin) */}
                {!isAdmin && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>PIN Lama:</span>
                      <span className="text-[10px] text-slate-400">4 Digit</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        maxLength={4}
                        value={oldPinInput}
                        onFocus={() => setActivePinField('old')}
                        onChange={e => setOldPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="****"
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 focus:outline-none transition ${
                          activePinField === 'old'
                            ? 'border-[#007DCC] ring-2 ring-blue-100'
                            : 'border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Field: PIN Baru */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>PIN Baru:</span>
                    <span className="text-[10px] text-slate-400">4 Digit</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      maxLength={4}
                      value={newPinInput}
                      onFocus={() => setActivePinField('new')}
                      onChange={e => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="****"
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-center text-lg font-mono tracking-widest text-[#007DCC] focus:outline-none transition ${
                        activePinField === 'new'
                          ? 'border-[#007DCC] ring-2 ring-blue-100'
                          : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Field: Konfirmasi PIN Baru */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Konfirmasi PIN Baru:</span>
                    <span className="text-[10px] text-slate-400">Ulangi</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      maxLength={4}
                      value={confirmPinInput}
                      onFocus={() => setActivePinField('confirm')}
                      onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="****"
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-center text-lg font-mono tracking-widest text-[#007DCC] focus:outline-none transition ${
                        activePinField === 'confirm'
                          ? 'border-[#007DCC] ring-2 ring-blue-100'
                          : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Toggle show/hide numbers */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showNewPin ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showNewPin ? 'Sembunyikan Angka' : 'Tampilkan Angka'}</span>
                  </button>
                </div>

                {/* Keypad for Quick Tapping on Mobile */}
                <div className="pt-1">
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleDigitClick(num)}
                        className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-base font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleClear}
                      className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitClick('0')}
                      className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-base font-bold text-slate-900 transition flex items-center justify-center border border-slate-200"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-500 transition flex items-center justify-center border border-slate-200"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#D10056] font-semibold flex items-center gap-1.5">
                    <ShieldAlert size={15} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg('');
                    }}
                    className="py-2.5 px-3 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-black bg-[#FFB900] hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} />
                    <span>Simpan PIN Baru</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
