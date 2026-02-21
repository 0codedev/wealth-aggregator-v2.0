
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, Upload, Repeat, Calendar, Tag, Globe, Briefcase, Eye, EyeOff, Save, ScanLine, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlayVariants, modalContentVariants } from './ui/animations';
import { Investment, InvestmentType, RecurringFrequency } from '../types';
import * as AIService from '../services/aiService';
import { useFamily } from '../contexts/FamilyContext';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id'>, id?: string) => void;
  editingInvestment?: Investment | null;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onSave, editingInvestment }) => {
  const { activeEntity } = useFamily();

  // Basic Info
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>(InvestmentType.MUTUAL_FUND);
  const [platform, setPlatform] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [dateInvested, setDateInvested] = useState(new Date().toISOString().split('T')[0]);

  // Advanced / Metadata
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('India');
  const [tagsInput, setTagsInput] = useState('');

  // Config
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>(RecurringFrequency.MONTHLY);
  const [recurringAmount, setRecurringAmount] = useState('');
  const [sipDay, setSipDay] = useState(5);
  const [sipStartDate, setSipStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHiddenFromTotals, setIsHiddenFromTotals] = useState(false);

  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setType(InvestmentType.MUTUAL_FUND);
    setPlatform('');
    setInvestedAmount('');
    setCurrentValue('');
    setDateInvested(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurringFrequency(RecurringFrequency.MONTHLY);
    setRecurringAmount('');
    setSipDay(5);
    setSipStartDate(new Date().toISOString().split('T')[0]);
    setSector('');
    setCountry('India');
    setTagsInput('');
    setIsHiddenFromTotals(false);
    setError('');
  };

  useEffect(() => {
    if (editingInvestment) {
      setName(editingInvestment.name);
      setType(editingInvestment.type);
      setPlatform(editingInvestment.platform);
      setInvestedAmount(String(editingInvestment.investedAmount));
      setCurrentValue(String(editingInvestment.currentValue));
      setDateInvested(editingInvestment.lastUpdated.split('T')[0]);
      setSector(editingInvestment.sector || '');
      setCountry(editingInvestment.country || 'India');
      setTagsInput(editingInvestment.tags ? editingInvestment.tags.join(', ') : '');
      setIsHiddenFromTotals(editingInvestment.isHiddenFromTotals || false);

      if (editingInvestment.recurring && editingInvestment.recurring.isEnabled) {
        setIsRecurring(true);
        setRecurringFrequency(editingInvestment.recurring.frequency);
        setRecurringAmount(String(editingInvestment.recurring.amount));
        setSipDay(editingInvestment.recurring.sipDay || 5);
        setSipStartDate(editingInvestment.recurring.startDate || editingInvestment.lastUpdated.split('T')[0]);
      } else {
        setIsRecurring(false);
        setRecurringFrequency(RecurringFrequency.MONTHLY);
        setRecurringAmount('');
        setSipDay(5);
        setSipStartDate(new Date().toISOString().split('T')[0]);
      }
    } else {
      resetForm();
    }
  }, [editingInvestment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !platform || !investedAmount || !currentValue) {
      setError('All fields are required');
      return;
    }

    const investmentOwner = editingInvestment?.owner || (activeEntity === 'ALL' ? 'SELF' : activeEntity);

    const investmentData: Omit<Investment, 'id'> = {
      name,
      type,
      platform,
      investedAmount: parseFloat(investedAmount),
      currentValue: parseFloat(currentValue),
      lastUpdated: new Date(dateInvested).toISOString(),
      sector: sector || undefined,
      country: country || undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      isHiddenFromTotals,
      owner: investmentOwner as Investment['owner'],
      recurring: isRecurring ? {
        isEnabled: true,
        frequency: recurringFrequency,
        amount: parseFloat(recurringAmount) || 0,
        sipDay: sipDay,
        startDate: sipStartDate,
        installmentsApplied: editingInvestment?.recurring?.installmentsApplied || 0
      } : undefined
    };

    onSave(investmentData, editingInvestment?.id);
    if (!editingInvestment) resetForm();
    onClose();
  };

  const handleFile = async (file: File) => {
    setIsScanning(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const prompt = `Analyze this financial screenshot... Return ONLY JSON with keys: name, platform, investedAmount, currentValue, date, sector, type.`;
        try {
          const response = await AIService.analyzeImage(base64String, prompt);
          const cleanJson = response.replace(/```json|```/g, '').trim();
          const data = JSON.parse(cleanJson);
          if (data.name) setName(data.name);
          if (data.platform) setPlatform(data.platform);
          if (data.investedAmount) setInvestedAmount(String(data.investedAmount));
          if (data.currentValue) setCurrentValue(String(data.currentValue));
          if (data.date) setDateInvested(data.date);
          if (data.sector) setSector(data.sector);
          if (data.type) {
            const validTypes = Object.values(InvestmentType);
            if (validTypes.includes(data.type)) setType(data.type);
          }
        } catch (err) {
          console.error(err);
          setError("Could not extract data. Please enter manually.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
      setError("Error reading file");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-slate-900/60"
            onClick={onClose}
          />

          <motion.div
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {editingInvestment ? <Edit2Icon /> : <ScanLine className="text-indigo-400" />}
                  {editingInvestment ? 'Edit Asset' : 'Add Asset'}
                </h2>
                <p className="text-sm text-slate-400">Manual entry or AI Screenshot Scan</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Smart Scan & Quick Figures */}
              <div className="md:col-span-4 bg-slate-900/30 p-6 space-y-6 border-r border-slate-800 overflow-y-auto">

                {/* Dropzone Scanner */}
                <div
                  className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ${dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf("image") !== -1) {
                        const blob = items[i].getAsFile();
                        if (blob) handleFile(blob);
                      }
                    }
                  }}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="w-full flex flex-col items-center justify-center gap-4 p-8 focus:outline-none"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-indigo-400 animate-pulse">Analyzing Screenshot...</p>
                      </>
                    ) : (
                      <>
                        <div className={`p-4 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-400 transition-colors`}>
                          <ImagePlus size={32} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-200">Drop Screenshot Here</p>
                          <p className="text-xs text-slate-500 mt-1">or <span className="text-indigo-400 hover:underline">Browse</span> • Paste (Ctrl+V)</p>
                        </div>
                      </>
                    )}
                  </button>
                </div>

                {/* Core Numbers */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-inner space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Invested Amount</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold group-focus-within:text-indigo-400 transition-colors">₹</span>
                      <input
                        type="number"
                        value={investedAmount}
                        onChange={(e) => setInvestedAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-lg font-bold text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Current Value</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold group-focus-within:text-emerald-400 transition-colors">₹</span>
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-lg font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Ghost Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isHiddenFromTotals ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                      {isHiddenFromTotals ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Ghost Mode</p>
                      <p className="text-[10px] text-slate-500">Hide from Total Net Worth</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isHiddenFromTotals} onChange={(e) => setIsHiddenFromTotals(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </div>

              {/* Right Column: Details Form */}
              <div className="md:col-span-8 p-6 overflow-y-auto max-h-[60vh] md:max-h-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Primary Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-indigo-400 transition-colors">Asset Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nifty 50 Index Fund" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-indigo-400 transition-colors">Platform / Broker</label>
                      <input type="text" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Zerodha" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-indigo-400 transition-colors">Category</label>
                      <div className="relative">
                        <select value={type} onChange={(e) => setType(e.target.value as InvestmentType)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white appearance-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                          {Object.values(InvestmentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-indigo-400 transition-colors">Date Invested</label>
                      <input type="date" value={dateInvested} onChange={(e) => setDateInvested(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all calendar-picker-indicator:invert" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-800 my-4" />

                  {/* Metadata Section */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="group">
                        <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 group-focus-within:text-indigo-400"><Briefcase size={12} /> Sector</label>
                        <input type="text" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Tech" className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div className="group">
                        <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 group-focus-within:text-indigo-400"><Globe size={12} /> Country</label>
                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div className="group">
                        <label className="flex items-center gap-2 text-xs text-slate-400 mb-2 group-focus-within:text-indigo-400"><Tag size={12} /> Tags</label>
                        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Long Term" className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Recurring / SIP Section */}
                  <div className={`border rounded-2xl transition-all duration-300 ${isRecurring ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-transparent border-slate-800'}`}>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer select-none"
                      onClick={() => setIsRecurring(!isRecurring)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isRecurring ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <Repeat size={16} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isRecurring ? 'text-indigo-400' : 'text-slate-400'}`}>Recurring Investment (SIP)</p>
                        </div>
                      </div>
                      {isRecurring && <span className="text-[10px] font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ACTIVE</span>}
                    </div>

                    {isRecurring && (
                      <div className="p-4 pt-0 grid grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5">Frequency</label>
                          <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)} className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white outline-none">
                            <option value={RecurringFrequency.MONTHLY}>Monthly</option>
                            <option value={RecurringFrequency.DAILY}>Daily</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1.5">SIP Amount</label>
                          <input type="number" value={recurringAmount} onChange={(e) => setRecurringAmount(e.target.value)} placeholder="5000" className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white outline-none" />
                        </div>
                        {recurringFrequency === RecurringFrequency.MONTHLY && (
                          <>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">SIP Day</label>
                              <select value={sipDay} onChange={(e) => setSipDay(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white outline-none">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1.5">Start Date</label>
                              <input type="date" value={sipStartDate} onChange={(e) => setSipStartDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white outline-none calendar-picker-indicator:invert" />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                </form>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 z-20">
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Save size={18} />
                {editingInvestment ? 'Update Asset' : 'Save Asset'}
              </button>
            </div>

            {error && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-in slide-in-from-bottom-2">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Edit2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
)

export default AddInvestmentModal;
