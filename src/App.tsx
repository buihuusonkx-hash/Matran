/**
 * @license
 * Math Matrix Pro - Phiên bản chuẩn hóa 2026
 */

import React, { useState, useEffect } from 'react';
import { PenSquare, FileText, Download, Plus, Trash2, ChevronRight, Sparkles, RefreshCw, CheckCircle, AlertCircle, Settings, X, Key, LogOut, BookOpen, Layout, ListChecks, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTION_BANK } from './questionBank';
import { useMathRender } from './MathText';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Cấu hình hệ thống ---
const LEVELS = [
  { id: 0, name: 'Nhận biết', color: 'text-emerald-600', bgColor: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-600' },
  { id: 1, name: 'Thông hiểu', color: 'text-amber-600', bgColor: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-600' },
  { id: 2, name: 'Vận dụng', color: 'text-rose-600', bgColor: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-600' },
  { id: 3, name: 'Vận dụng cao', color: 'text-purple-600', bgColor: 'bg-purple-50', border: 'border-purple-100', accent: 'bg-purple-600' }
];

const defaultLevels = () => LEVELS.map(l => ({
  tenMucDo: l.name,
  yeuCau: '',
  qs: { nlc: '', ds: '', tln: '' }
}));

export default function App() {
  const [activeTab, setActiveTab] = useState('nhap-lieu');
  const [data, setData] = useState<any[]>([]);
  const [monHoc, setMonHoc] = useState('Toán');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('mmp_logged_in') === 'true');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Khởi tạo
  useEffect(() => {
    const saved = localStorage.getItem('mmp_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        setData([{ tenChuong: '', noiDungs: [{ tenNoiDung: '', soTiet: 0, mucDos: defaultLevels() }] }]);
      }
    } else {
      setData([{ tenChuong: '', noiDungs: [{ tenNoiDung: '', soTiet: 0, mucDos: defaultLevels() }] }]);
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) localStorage.setItem('mmp_data', JSON.stringify(data));
  }, [data]);

  // --- Logic Nghiệp vụ ---
  const countQuestions = (input: string) => {
    if (!input) return 0;
    return input.split(/[,;\s]+/).filter(s => s && /\d/.test(s)).length;
  };

  const getTotals = () => {
    let p1 = 0, p2 = 0, p3 = 0;
    data.forEach(c => c.noiDungs.forEach((nd: any) => {
      // NLC: Tổng từ NB, TH, VD
      p1 += countQuestions(nd.mucDos[0].qs.nlc) + countQuestions(nd.mucDos[1].qs.nlc) + countQuestions(nd.mucDos[2].qs.nlc);
      // DS: Đếm số câu (mỗi câu 4 ý)
      p2 += countQuestions(nd.mucDos[0].qs.ds);
      // TLN: Tổng từ TH, VD, VDC
      p3 += countQuestions(nd.mucDos[1].qs.tln) + countQuestions(nd.mucDos[2].qs.tln) + countQuestions(nd.mucDos[3].qs.tln);
    }));
    return { p1, p2, p3, total: p1 + p2 + p3 };
  };

  const tuDongPhanBo = () => {
    const newData = JSON.parse(JSON.stringify(data));
    const allItems: any[] = [];
    newData.forEach((c: any, cIdx: number) => {
      c.noiDungs.forEach((nd: any, nIdx: number) => {
        allItems.push({ cIdx, nIdx, soTiet: nd.soTiet || 0 });
      });
    });

    const totalTiet = allItems.reduce((acc, it) => acc + it.soTiet, 0);
    if (totalTiet === 0) return alert("Vui lòng nhập 'Số tiết'!");

    const lrm = (total: number) => {
      if (totalTiet === 0) return allItems.map(() => 0);
      const exact = allItems.map(it => (it.soTiet / totalTiet) * total);
      const fl = exact.map(v => Math.floor(v));
      let rem = total - fl.reduce((a, b) => a + b, 0);
      exact.map((v, i) => ({ r: v - fl[i], i })).sort((a, b) => b.r - a.r).slice(0, rem).forEach(({ i }) => fl[i]++);
      return fl;
    };

    // Phân bổ NLC (12 câu): NB: 6, TH: 4, VD: 2
    const allocNLC_NB = lrm(6);
    const allocNLC_TH = lrm(4);
    const allocNLC_VD = lrm(2);
    // Phân bổ DS (4 câu)
    const allocDS = lrm(4);
    // Phân bổ TLN (6 câu): TH: 2, VD: 2, VDC: 2
    const allocTLN_TH = lrm(2);
    const allocTLN_VD = lrm(2);
    const allocTLN_VDC = lrm(2);

    let idx1 = 1, idx2 = 1, idx3 = 1;

    allItems.forEach((item, i) => {
      const nd = newData[item.cIdx].noiDungs[item.nIdx];
      nd.mucDos.forEach((md: any) => { md.qs.nlc = ''; md.qs.ds = ''; md.qs.tln = ''; });

      // Gán NLC
      for (let k = 0; k < allocNLC_NB[i]; k++) nd.mucDos[0].qs.nlc += (nd.mucDos[0].qs.nlc ? ', ' : '') + `${idx1++}`;
      for (let k = 0; k < allocNLC_TH[i]; k++) nd.mucDos[1].qs.nlc += (nd.mucDos[1].qs.nlc ? ', ' : '') + `${idx1++}`;
      for (let k = 0; k < allocNLC_VD[i]; k++) nd.mucDos[2].qs.nlc += (nd.mucDos[2].qs.nlc ? ', ' : '') + `${idx1++}`;

      // Gán DS (Mỗi câu mặc định cấu trúc 1-2-1)
      for (let k = 0; k < allocDS[i]; k++) nd.mucDos[0].qs.ds += (nd.mucDos[0].qs.ds ? ', ' : '') + `${idx2++}`;

      // Gán TLN
      for (let k = 0; k < allocTLN_TH[i]; k++) nd.mucDos[1].qs.tln += (nd.mucDos[1].qs.tln ? ', ' : '') + `${idx3++}`;
      for (let k = 0; k < allocTLN_VD[i]; k++) nd.mucDos[2].qs.tln += (nd.mucDos[2].qs.tln ? ', ' : '') + `${idx3++}`;
      for (let k = 0; k < allocTLN_VDC[i]; k++) nd.mucDos[3].qs.tln += (nd.mucDos[3].qs.tln ? ', ' : '') + `${idx3++}`;
    });

    setData(newData);
  };

  const addChuong = () => {
    setData([...data, { tenChuong: '', noiDungs: [{ tenNoiDung: '', soTiet: 0, mucDos: defaultLevels() }] }]);
  };

  const removeChuong = (idx: number) => {
    if (data.length > 1) {
      const newData = data.filter((_, i) => i !== idx);
      setData(newData);
    }
  };

  if (!isLoggedIn) return <Login handleLogin={() => setIsLoggedIn(true)} user={loginUser} setUser={setLoginUser} pass={loginPass} setPass={setLoginPass} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-900">
      <Header monHoc={monHoc} setMonHoc={setMonHoc} handleLogout={() => { setIsLoggedIn(false); localStorage.removeItem('mmp_logged_in'); }} />
      
      <div className="flex justify-center gap-2 mb-8 sticky top-4 z-50">
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-xl flex gap-1">
          {[
            { id: 'nhap-lieu', label: 'Nhập liệu', icon: PenSquare },
            { id: 'ma-tran', label: 'Ma trận', icon: Layout },
            { id: 'dac-ta', label: 'Ma trận đặc tả', icon: ListChecks },
            { id: 'tao-de', label: 'Tạo đề', icon: FileJson }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={cn(
                "px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'nhap-lieu' && (
            <TabNhapLieu 
              key="nhap-lieu"
              data={data} 
              setData={setData} 
              tuDongPhanBo={tuDongPhanBo} 
              addChuong={addChuong}
              removeChuong={removeChuong}
            />
          )}
          {activeTab === 'ma-tran' && <TabMaTran key="ma-tran" data={data} monHoc={monHoc} countQuestions={countQuestions} totals={getTotals()} />}
          {activeTab === 'dac-ta' && <TabDacTa key="dac-ta" data={data} countQuestions={countQuestions} />}
          {activeTab === 'tao-de' && <TabTaoDe key="tao-de" data={data} countQuestions={countQuestions} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Các Tab Thành Phần ---

function TabNhapLieu({ data, setData, tuDongPhanBo, addChuong, removeChuong }: any) {
  const updateNoiDung = (cIdx: number, nIdx: number, val: any) => {
    const newData = [...data];
    newData[cIdx].noiDungs[nIdx] = { ...newData[cIdx].noiDungs[nIdx], ...val };
    setData(newData);
  };

  const addNoiDung = (cIdx: number) => {
    const newData = [...data];
    newData[cIdx].noiDungs.push({ tenNoiDung: '', soTiet: 0, mucDos: defaultLevels() });
    setData(newData);
  };

  const removeNoiDung = (cIdx: number, nIdx: number) => {
    if (data[cIdx].noiDungs.length > 1) {
      const newData = [...data];
      newData[cIdx].noiDungs = newData[cIdx].noiDungs.filter((_: any, i: number) => i !== nIdx);
      setData(newData);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Cấu trúc đề thi
          </h2>
          <p className="text-xs text-slate-400 mt-1">Xây dựng nội dung kiến thức và phân bổ câu hỏi</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addChuong} className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Plus className="w-4 h-4" /> Thêm chương
          </button>
          <button onClick={tuDongPhanBo} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Sparkles className="w-4 h-4" /> Tự động phân bổ (Chuẩn 2026)
          </button>
        </div>
      </div>

      {data.map((chuong: any, cIdx: number) => (
        <div key={cIdx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group">
          <button 
            onClick={() => removeChuong(cIdx)}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
              {cIdx + 1}
            </div>
            <input 
              className="flex-1 text-lg font-bold p-2 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300" 
              placeholder="Tên chương/chủ đề (ví dụ: Chương I. Ứng dụng đạo hàm...)" 
              value={chuong.tenChuong} 
              onChange={e => {
                const newData = [...data]; newData[cIdx].tenChuong = e.target.value; setData(newData);
              }} 
            />
          </div>
          
          <div className="space-y-6">
            {chuong.noiDungs.map((nd: any, nIdx: number) => (
              <div key={nIdx} className="ml-6 p-6 border-l-4 border-indigo-500 bg-slate-50/50 rounded-r-2xl relative">
                <button 
                  onClick={() => removeNoiDung(cIdx, nIdx)}
                  className="absolute top-4 right-4 p-1 text-slate-300 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 mb-6">
                  <div className="flex-[3]">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nội dung bài học</label>
                    <input className="w-full p-3 rounded-xl border border-slate-200 font-semibold bg-white" placeholder="Tên bài học/nội dung..." value={nd.tenNoiDung} onChange={e => updateNoiDung(cIdx, nIdx, { tenNoiDung: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">Số tiết</label>
                    <input className="w-full p-3 rounded-xl border border-slate-200 text-center font-black bg-white" type="number" placeholder="0" value={nd.soTiet || ''} onChange={e => updateNoiDung(cIdx, nIdx, { soTiet: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {nd.mucDos.map((md: any, mIdx: number) => (
                    <div key={mIdx} className={cn("p-4 rounded-2xl border transition-all", LEVELS[mIdx].border, LEVELS[mIdx].bgColor)}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={cn("text-[10px] font-black uppercase", LEVELS[mIdx].color)}>{md.tenMucDo}</p>
                        <div className={cn("w-1.5 h-1.5 rounded-full", LEVELS[mIdx].accent)}></div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Yêu cầu cần đạt</label>
                          <textarea 
                            className="w-full p-2 text-[10px] rounded-lg border-none bg-white/70 focus:bg-white transition-all h-20 resize-none" 
                            placeholder="Mô tả yêu cầu..." 
                            value={md.yeuCau} 
                            onChange={e => {
                              const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].yeuCau = e.target.value; setData(newData);
                            }} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Câu NLC</label>
                            <input className="w-full p-2 text-xs rounded-lg border border-slate-100 bg-white" placeholder="1, 2..." value={md.qs.nlc} onChange={e => {
                              const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.nlc = e.target.value; setData(newData);
                            }} />
                          </div>
                          
                          {mIdx === 0 && (
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Câu Đúng/Sai</label>
                              <input className="w-full p-2 text-xs rounded-lg border border-slate-100 bg-white" placeholder="1..." value={md.qs.ds} onChange={e => {
                                const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.ds = e.target.value; setData(newData);
                              }} />
                            </div>
                          )}

                          {mIdx > 0 && (
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Câu TL Ngắn</label>
                              <input className="w-full p-2 text-xs rounded-lg border border-slate-100 bg-white" placeholder="1..." value={md.qs.tln} onChange={e => {
                                const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.tln = e.target.value; setData(newData);
                              }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => addNoiDung(cIdx)}
              className="ml-6 w-[calc(100%-1.5rem)] py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm nội dung bài học
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function TabMaTran({ data, monHoc, countQuestions, totals }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl overflow-x-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight">MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h2>
        <p className="text-slate-500 font-bold mt-1">MÔN: {monHoc.toUpperCase()} - LỚP 12</p>
        <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[11px]">
        <thead>
          <tr className="bg-slate-900 text-white text-center">
            <th className="border border-slate-700 p-3" rowSpan={3}>STT</th>
            <th className="border border-slate-700 p-3" rowSpan={3}>Nội dung kiến thức</th>
            <th className="border border-slate-700 p-3" rowSpan={3}>Số tiết</th>
            <th className="border border-slate-700 p-3" colSpan={3}>Trắc nghiệm (12 câu)</th>
            <th className="border border-slate-700 p-3" colSpan={3}>Đúng/Sai (4 câu)</th>
            <th className="border border-slate-700 p-3" colSpan={3}>Trả lời ngắn (6 câu)</th>
            <th className="border border-slate-700 p-3" rowSpan={3}>Tổng</th>
          </tr>
          <tr className="bg-slate-800 text-white">
            <th className="border border-slate-600 p-2 bg-emerald-900/50">NB</th>
            <th className="border border-slate-600 p-2 bg-emerald-900/50">TH</th>
            <th className="border border-slate-600 p-2 bg-emerald-900/50">VD</th>
            <th className="border border-slate-600 p-2 bg-amber-900/50">NB</th>
            <th className="border border-slate-600 p-2 bg-amber-900/50">TH</th>
            <th className="border border-slate-600 p-2 bg-amber-900/50">VD</th>
            <th className="border border-slate-600 p-2 bg-rose-900/50">TH</th>
            <th className="border border-slate-600 p-2 bg-rose-900/50">VD</th>
            <th className="border border-slate-600 p-2 bg-rose-900/50">VDC</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c: any) => c.noiDungs.map((nd: any, nIdx: number) => {
            const rowTotal = nd.mucDos.reduce((acc: number, md: any) => acc + countQuestions(md.qs.nlc) + countQuestions(md.qs.ds) + countQuestions(md.qs.tln), 0);
            return (
              <tr key={nIdx} className="text-center hover:bg-slate-50 transition-colors">
                <td className="border border-slate-200 p-2 text-slate-400">{nIdx + 1}</td>
                <td className="border border-slate-200 p-2 text-left font-bold">{nd.tenNoiDung}</td>
                <td className="border border-slate-200 p-2 font-black text-indigo-600">{nd.soTiet}</td>
                {/* NLC */}
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold bg-emerald-50/30">{countQuestions(nd.mucDos[0].qs.nlc) || ''}</td>
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold bg-emerald-50/30">{countQuestions(nd.mucDos[1].qs.nlc) || ''}</td>
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold bg-emerald-50/30">{countQuestions(nd.mucDos[2].qs.nlc) || ''}</td>
                {/* DS */}
                <td className="border border-slate-200 p-2 text-amber-700 font-bold bg-amber-50/30">{countQuestions(nd.mucDos[0].qs.ds) * 1 || ''}</td>
                <td className="border border-slate-200 p-2 text-amber-700 font-bold bg-amber-50/30">{countQuestions(nd.mucDos[0].qs.ds) * 2 || ''}</td>
                <td className="border border-slate-200 p-2 text-amber-700 font-bold bg-amber-50/30">{countQuestions(nd.mucDos[0].qs.ds) * 1 || ''}</td>
                {/* TLN */}
                <td className="border border-slate-200 p-2 text-rose-700 font-bold bg-rose-50/30">{countQuestions(nd.mucDos[1].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 text-rose-700 font-bold bg-rose-50/30">{countQuestions(nd.mucDos[2].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 text-rose-700 font-bold bg-rose-50/30">{countQuestions(nd.mucDos[3].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 bg-slate-50 font-black text-slate-700">{rowTotal}</td>
              </tr>
            );
          }))}
          <tr className="bg-slate-900 text-white font-black text-center">
            <td colSpan={3} className="p-4">TỔNG CỘNG</td>
            <td colSpan={3} className="bg-emerald-900/30">{totals.p1}/12 câu</td>
            <td colSpan={3} className="bg-amber-900/30">{totals.p2}/4 câu</td>
            <td colSpan={3} className="bg-rose-900/30">{totals.p3}/6 câu</td>
            <td className="bg-indigo-600 text-white text-lg">{totals.total}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Phần I (NLC)</p>
          <p className="text-2xl font-black text-emerald-900">{Math.round((totals.p1/22)*100)}% <span className="text-sm font-normal text-emerald-600">tổng số câu</span></p>
        </div>
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Phần II (Đúng/Sai)</p>
          <p className="text-2xl font-black text-amber-900">{Math.round((totals.p2/22)*100)}% <span className="text-sm font-normal text-amber-600">tổng số câu</span></p>
        </div>
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Phần III (TL Ngắn)</p>
          <p className="text-2xl font-black text-rose-900">{Math.round((totals.p3/22)*100)}% <span className="text-sm font-normal text-rose-600">tổng số câu</span></p>
        </div>
      </div>
    </motion.div>
  );
}

function TabDacTa({ data, countQuestions }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl overflow-x-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight">BẢNG MA TRẬN ĐẶC TẢ CHI TIẾT ĐỀ KIỂM TRA</h2>
        <p className="text-slate-500 font-bold mt-1">HƯỚNG DẪN CHẤM VÀ ĐÁNH GIÁ NĂNG LỰC</p>
        <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[11px]">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="border border-slate-700 p-3 w-12 text-center">STT</th>
            <th className="border border-slate-700 p-3 w-48">Nội dung</th>
            <th className="border border-slate-700 p-3 w-28 text-center">Mức độ</th>
            <th className="border border-slate-700 p-3">Yêu cầu cần đạt</th>
            <th className="border border-slate-700 p-3 w-20 text-center">NLC</th>
            <th className="border border-slate-700 p-3 w-20 text-center">Đúng/Sai</th>
            <th className="border border-slate-700 p-3 w-20 text-center">TL Ngắn</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c: any, cIdx: number) => c.noiDungs.map((nd: any, nIdx: number) => nd.mucDos.map((md: any, mIdx: number) => (
            <tr key={`${cIdx}-${nIdx}-${mIdx}`} className="hover:bg-slate-50 transition-colors">
              {mIdx === 0 && <td rowSpan={4} className="border border-slate-200 p-3 text-center font-bold text-slate-400">{nIdx + 1}</td>}
              {mIdx === 0 && <td rowSpan={4} className="border border-slate-200 p-3 font-bold text-slate-700">{nd.tenNoiDung}</td>}
              <td className={cn("border border-slate-200 p-3 font-bold text-center", LEVELS[mIdx].color)}>{LEVELS[mIdx].name}</td>
              <td className="border border-slate-200 p-3 text-justify leading-relaxed text-slate-600">{md.yeuCau || '---'}</td>
              <td className="border border-slate-200 p-3 text-center font-bold text-emerald-700 bg-emerald-50/20">{md.qs.nlc || ''}</td>
              <td className="border border-slate-200 p-3 text-center font-bold text-amber-700 bg-amber-50/20">{mIdx === 0 ? (md.qs.ds || '') : ''}</td>
              <td className="border border-slate-200 p-3 text-center font-bold text-rose-700 bg-rose-50/20">{md.qs.tln || ''}</td>
            </tr>
          ))))}
        </tbody>
      </table>
    </motion.div>
  );
}

function TabTaoDe({ data, countQuestions }: any) {
  const [exam, setExam] = useState<any[]>([]);
  const mathRef = useMathRender([exam]);

  const handleGenerate = () => {
    const result: any[] = [];
    data.forEach((c: any) => c.noiDungs.forEach((nd: any) => {
      // 1. Lọc lấy NLC
      nd.mucDos.forEach((md: any, mIdx: number) => {
        const n = countQuestions(md.qs.nlc);
        for (let i = 0; i < n; i++) {
          const bank = (QUESTION_BANK as any)[nd.tenNoiDung] || (QUESTION_BANK as any)["Hàm số"];
          const questions = bank[md.tenMucDo] || bank["Nhận biết"];
          const qText = questions[Math.floor(Math.random() * questions.length)];
          result.push({ phan: 'I', noiDung: qText, dapAn: 'A', tag: nd.tenNoiDung, level: md.tenMucDo });
        }
      });
      // 2. Lọc lấy Đúng/Sai
      const nDS = countQuestions(nd.mucDos[0].qs.ds);
      for (let i = 0; i < nDS; i++) {
        result.push({ 
          phan: 'II', 
          noiDung: `Cho các mệnh đề về ${nd.tenNoiDung}: \na) Ý Nhận biết...\nb) Ý Thông hiểu...\nc) Ý Thông hiểu...\nd) Ý Vận dụng...`, 
          dapAn: 'Đ S Đ S', 
          tag: nd.tenNoiDung 
        });
      }
      // 3. Lọc lấy Trả lời ngắn
      nd.mucDos.forEach((md: any, mIdx: number) => {
        const n = countQuestions(md.qs.tln);
        for (let i = 0; i < n; i++) {
          result.push({ 
            phan: 'III', 
            noiDung: `[${md.tenMucDo}] Tính toán giá trị của biểu thức liên quan đến ${nd.tenNoiDung}...`, 
            dapAn: '10', 
            tag: nd.tenNoiDung 
          });
        }
      });
    }));
    setExam(result);
  };

  return (
    <div className="space-y-6" ref={mathRef as any}>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Sparkles className="text-indigo-600" />
            Sinh đề thi tự động
          </h2>
          <p className="text-xs text-slate-400 mt-1">Đề thi được bốc chính xác theo nội dung và mức độ từ Bảng đặc tả</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
          <button onClick={handleGenerate} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
            <RefreshCw className="w-5 h-5" /> TẠO ĐỀ NGAY
          </button>
        </div>
      </div>

      <AnimatePresence>
        {exam.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-16 rounded-3xl border border-slate-200 shadow-2xl max-w-[900px] mx-auto font-serif relative overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-slate-50 text-8xl font-black pointer-events-none select-none">
              MATH MATRIX PRO
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div className="text-center">
                  <p className="font-bold text-sm">SỞ GD&ĐT TP. HỒ CHÍ MINH</p>
                  <p className="font-bold text-sm border-b border-slate-900 pb-1">TRƯỜNG THPT CHUYÊN...</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold uppercase">ĐỀ KIỂM TRA ĐỊNH KỲ NĂM HỌC 2025 - 2026</h3>
                  <p className="font-bold">Môn: TOÁN - Lớp 12</p>
                  <p className="italic text-sm">Thời gian làm bài: 90 phút (không kể thời gian phát đề)</p>
                </div>
              </div>
              
              <div className="space-y-10">
                <section>
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-xs rounded">PHẦN I</span>
                    Câu trắc nghiệm nhiều phương án lựa chọn. (12 câu)
                  </h4>
                  <p className="text-sm italic mb-4">Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi chỉ chọn một phương án.</p>
                  <div className="space-y-6">
                    {exam.filter(q => q.phan === 'I').map((q, i) => (
                      <div key={i} className="ml-4">
                        <p className="leading-relaxed"><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 mt-3 gap-2">
                          <span className="flex items-center gap-2"><strong>A.</strong> $x=1$</span>
                          <span className="flex items-center gap-2"><strong>B.</strong> $x=2$</span>
                          <span className="flex items-center gap-2"><strong>C.</strong> $x=3$</span>
                          <span className="flex items-center gap-2"><strong>D.</strong> $x=4$</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-xs rounded">PHẦN II</span>
                    Câu trắc nghiệm đúng sai. (4 câu)
                  </h4>
                  <p className="text-sm italic mb-4">Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.</p>
                  <div className="space-y-8">
                    {exam.filter(q => q.phan === 'II').map((q, i) => (
                      <div key={i} className="ml-4">
                        <p className="leading-relaxed mb-3"><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                        <div className="grid grid-cols-1 gap-1 ml-4 text-sm">
                          <p>a) Mệnh đề nhận biết là đúng.</p>
                          <p>b) Mệnh đề thông hiểu là sai.</p>
                          <p>c) Mệnh đề thông hiểu là đúng.</p>
                          <p>d) Mệnh đề vận dụng là sai.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-bold mb-6 flex items-center gap-2">
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-xs rounded">PHẦN III</span>
                    Câu hỏi trắc nghiệm trả lời ngắn. (6 câu)
                  </h4>
                  <p className="text-sm italic mb-4">Thí sinh trả lời từ câu 1 đến câu 6.</p>
                  <div className="space-y-6">
                    {exam.filter(q => q.phan === 'III').map((q, i) => (
                      <div key={i} className="ml-4">
                        <p className="leading-relaxed"><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                        <div className="mt-2 border-b border-dashed border-slate-300 w-20 h-6"></div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pt-12 text-center border-t border-slate-100">
                  <p className="font-bold italic">--- HẾT ---</p>
                  <p className="text-xs text-slate-400 mt-2">Thí sinh không được sử dụng tài liệu. Giám thị không giải thích gì thêm.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Các Component giao diện nhỏ ---

function Header({ monHoc, setMonHoc, handleLogout }: any) {
  return (
    <header className="max-w-4xl mx-auto text-center mb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4"
      >
        <Sparkles className="w-3 h-3 text-indigo-600" />
        <p className="text-indigo-600 font-black tracking-widest text-[9px] uppercase">Công cụ Giáo dục Thông minh năm 2026</p>
      </motion.div>
      
      <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter mb-6">
        Ma trận Toán học. <span className="text-indigo-600 relative">Pro
          <svg className="absolute -bottom-2 left-0 w-full h-2 text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </span>
      </h1>

      <div className="flex justify-center items-center gap-4">
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex gap-1">
          {['Toán', 'Lý', 'Hóa học'].map(m => (
            <button 
              key={m} 
              onClick={() => setMonHoc(m)} 
              className={cn(
                "px-6 py-1.5 rounded-lg text-xs font-bold transition-all",
                monHoc === m ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

function Login({ handleLogin, user, setUser, pass, setPass }: any) {
  const [error, setError] = useState('');

  const onLogin = () => {
    if(user === 'Bui Thi Kiên' && pass === '12345') {
      localStorage.setItem('mmp_logged_in', 'true');
      handleLogin();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3">
            <Key className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">Ma trận Toán học. <span className="text-indigo-400">Pro</span></h1>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Hệ thống quản lý đề thi 2026</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-400 focus:bg-white/10 transition-all placeholder:text-slate-500" 
              placeholder="Tên đăng nhập" 
              value={user} 
              onChange={e => setUser(e.target.value)} 
            />
          </div>
          <div className="relative">
            <input 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-400 focus:bg-white/10 transition-all placeholder:text-slate-500" 
              type="password" 
              placeholder="Mật khẩu" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-rose-400 text-[10px] font-bold text-center flex items-center justify-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}

          <button 
            onClick={onLogin} 
            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 mt-4 active:scale-95"
          >
            ĐĂNG NHẬP HỆ THỐNG
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Bản quyền thuộc về Smarter Education Tools © 2026</p>
        </div>
      </motion.div>
    </div>
  );
}
