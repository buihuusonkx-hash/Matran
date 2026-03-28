/**
 * @license
 * Math Matrix Pro - Phiên bản chuẩn hóa 2026
 */

import React, { useState, useEffect } from 'react';
import { PenSquare, FileText, Download, Plus, Trash2, ChevronRight, Sparkles, RefreshCw, CheckCircle, AlertCircle, Settings, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTION_BANK } from './questionBank';
import { useMathRender } from './MathText';

// --- Cấu hình hệ thống ---
const LEVELS = [
  { id: 0, name: 'Nhận biết', color: 'text-emerald-600', bgColor: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 1, name: 'Thông hiểu', color: 'text-amber-600', bgColor: 'bg-amber-50', border: 'border-amber-100' },
  { id: 2, name: 'Vận dụng', color: 'text-rose-600', bgColor: 'bg-rose-50', border: 'border-rose-100' },
  { id: 3, name: 'Vận dụng cao', color: 'text-purple-600', bgColor: 'bg-purple-50', border: 'border-purple-100' }
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
    if (saved) setData(JSON.parse(saved));
    else setData([{ tenChuong: '', noiDungs: [{ tenNoiDung: '', soTiet: 0, mucDos: defaultLevels() }] }]);
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
      for (let k = 0; k < allocNLC_NB[i]; k++) nd.mucDos[0].qs.nlc += (nd.mucDos[0].qs.nlc ? ', ' : '') + `Câu ${idx1++}`;
      for (let k = 0; k < allocNLC_TH[i]; k++) nd.mucDos[1].qs.nlc += (nd.mucDos[1].qs.nlc ? ', ' : '') + `Câu ${idx1++}`;
      for (let k = 0; k < allocNLC_VD[i]; k++) nd.mucDos[2].qs.nlc += (nd.mucDos[2].qs.nlc ? ', ' : '') + `Câu ${idx1++}`;

      // Gán DS (Mỗi câu mặc định cấu trúc 1-2-1)
      for (let k = 0; k < allocDS[i]; k++) nd.mucDos[0].qs.ds += (nd.mucDos[0].qs.ds ? ', ' : '') + `Câu ${idx2++}`;

      // Gán TLN
      for (let k = 0; k < allocTLN_TH[i]; k++) nd.mucDos[1].qs.tln += (nd.mucDos[1].qs.tln ? ', ' : '') + `Câu ${idx3++}`;
      for (let k = 0; k < allocTLN_VD[i]; k++) nd.mucDos[2].qs.tln += (nd.mucDos[2].qs.tln ? ', ' : '') + `Câu ${idx3++}`;
      for (let k = 0; k < allocTLN_VDC[i]; k++) nd.mucDos[3].qs.tln += (nd.mucDos[3].qs.tln ? ', ' : '') + `Câu ${idx3++}`;
    });

    setData(newData);
  };

  if (!isLoggedIn) return <Login handleLogin={() => setIsLoggedIn(true)} user={loginUser} setUser={setLoginUser} pass={loginPass} setPass={setLoginPass} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans">
      <Header monHoc={monHoc} setMonHoc={setMonHoc} handleLogout={() => { setIsLoggedIn(false); localStorage.removeItem('mmp_logged_in'); }} />
      
      <div className="flex justify-center gap-2 mb-8">
        {['nhap-lieu', 'ma-tran', 'dac-ta', 'tao-de'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>
            {tab === 'nhap-lieu' ? 'Nhập liệu' : tab === 'ma-tran' ? 'Ma trận' : tab === 'dac-ta' ? 'Đặc tả' : 'Tạo đề'}
          </button>
        ))}
      </div>

      <main className="max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'nhap-lieu' && <TabNhapLieu data={data} setData={setData} tuDongPhanBo={tuDongPhanBo} />}
          {activeTab === 'ma-tran' && <TabMaTran data={data} monHoc={monHoc} countQuestions={countQuestions} totals={getTotals()} />}
          {activeTab === 'dac-ta' && <TabDacTa data={data} countQuestions={countQuestions} />}
          {activeTab === 'tao-de' && <TabTaoDe data={data} countQuestions={countQuestions} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Các Tab Thành Phần ---

function TabNhapLieu({ data, setData, tuDongPhanBo }: any) {
  const updateNoiDung = (cIdx: number, nIdx: number, val: any) => {
    const newData = [...data];
    newData[cIdx].noiDungs[nIdx] = { ...newData[cIdx].noiDungs[nIdx], ...val };
    setData(newData);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black">Cấu trúc đề thi</h2>
        <button onClick={tuDongPhanBo} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <Sparkles className="w-4 h-4" /> Tự động phân bổ (Chuẩn 2026)
        </button>
      </div>

      {data.map((chuong: any, cIdx: number) => (
        <div key={cIdx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <input className="w-full text-lg font-bold mb-4 p-2 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500" placeholder="Tên chương/chủ đề..." value={chuong.tenChuong} onChange={e => {
            const newData = [...data]; newData[cIdx].tenChuong = e.target.value; setData(newData);
          }} />
          
          {chuong.noiDungs.map((nd: any, nIdx: number) => (
            <div key={nIdx} className="ml-6 mt-4 p-4 border-l-4 border-indigo-500 bg-slate-50/50 rounded-r-xl">
              <div className="flex gap-4 mb-4">
                <input className="flex-[3] p-3 rounded-xl border border-slate-200 font-semibold" placeholder="Tên bài học/nội dung..." value={nd.tenNoiDung} onChange={e => updateNoiDung(cIdx, nIdx, { tenNoiDung: e.target.value })} />
                <input className="flex-1 p-3 rounded-xl border border-slate-200 text-center font-black" type="number" placeholder="Số tiết" value={nd.soTiet || ''} onChange={e => updateNoiDung(cIdx, nIdx, { soTiet: parseInt(e.target.value) || 0 })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {nd.mucDos.map((md: any, mIdx: number) => (
                  <div key={mIdx} className={`p-3 rounded-xl border ${LEVELS[mIdx].border} ${LEVELS[mIdx].bgColor}`}>
                    <p className={`text-[10px] font-black uppercase mb-2 ${LEVELS[mIdx].color}`}>{md.tenMucDo}</p>
                    <textarea className="w-full p-2 text-[10px] rounded-lg border-none bg-white/50 mb-2 h-16" placeholder="Yêu cầu cần đạt..." value={md.yeuCau} onChange={e => {
                      const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].yeuCau = e.target.value; setData(newData);
                    }} />
                    <input className="w-full p-2 text-xs rounded-lg border border-slate-100" placeholder="Câu hỏi (ví dụ: 1, 2)" value={md.qs.nlc} onChange={e => {
                      const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.nlc = e.target.value; setData(newData);
                    }} title="Nhiều lựa chọn" />
                    <input className="w-full p-2 text-xs rounded-lg border border-slate-100 mt-1" placeholder="Câu TLN (ví dụ: 1)" value={md.qs.tln} onChange={e => {
                      const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.tln = e.target.value; setData(newData);
                    }} title="Trả lời ngắn" />
                    {mIdx === 0 && (
                      <input className="w-full p-2 text-xs rounded-lg border border-slate-100 mt-1 bg-amber-100/50" placeholder="Câu Đúng/Sai" value={md.qs.ds} onChange={e => {
                        const newData = [...data]; newData[cIdx].noiDungs[nIdx].mucDos[mIdx].qs.ds = e.target.value; setData(newData);
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

function TabMaTran({ data, monHoc, countQuestions, totals }: any) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
      <h2 className="text-2xl font-black text-center mb-8 uppercase">MA TRẬN ĐỀ KIỂM TRA MÔN {monHoc} 12</h2>
      <table className="w-full border-collapse border border-slate-300 text-[10px]">
        <thead>
          <tr className="bg-slate-900 text-white text-center">
            <th className="border border-slate-700 p-2" rowSpan={3}>STT</th>
            <th className="border border-slate-700 p-2" rowSpan={3}>Nội dung kiến thức</th>
            <th className="border border-slate-700 p-2" rowSpan={3}>Số tiết</th>
            <th className="border border-slate-700 p-2" colSpan={3}>Trắc nghiệm (12 câu)</th>
            <th className="border border-slate-700 p-2" colSpan={3}>Đúng/Sai (4 câu)</th>
            <th className="border border-slate-700 p-2" colSpan={3}>Trả lời ngắn (6 câu)</th>
            <th className="border border-slate-700 p-2" rowSpan={3}>Tổng</th>
          </tr>
          <tr className="bg-slate-800 text-white">
            <th className="border border-slate-600 p-1" style={{background:'#065f46'}}>NB</th>
            <th className="border border-slate-600 p-1" style={{background:'#065f46'}}>TH</th>
            <th className="border border-slate-600 p-1" style={{background:'#065f46'}}>VD</th>
            <th className="border border-slate-600 p-1" style={{background:'#92400e'}}>NB</th>
            <th className="border border-slate-600 p-1" style={{background:'#92400e'}}>TH</th>
            <th className="border border-slate-600 p-1" style={{background:'#92400e'}}>VD</th>
            <th className="border border-slate-600 p-1" style={{background:'#7f1d1d'}}>TH</th>
            <th className="border border-slate-600 p-1" style={{background:'#7f1d1d'}}>VD</th>
            <th className="border border-slate-600 p-1" style={{background:'#7f1d1d'}}>VDC</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c: any) => c.noiDungs.map((nd: any, nIdx: number) => {
            const rowTotal = nd.mucDos.reduce((acc: number, md: any) => acc + countQuestions(md.qs.nlc) + countQuestions(md.qs.ds) + countQuestions(md.qs.tln), 0);
            return (
              <tr key={nIdx} className="text-center hover:bg-slate-50">
                <td className="border border-slate-200 p-2">{nIdx + 1}</td>
                <td className="border border-slate-200 p-2 text-left font-bold">{nd.tenNoiDung}</td>
                <td className="border border-slate-200 p-2 font-black text-blue-600">{nd.soTiet}</td>
                {/* NLC */}
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold">{countQuestions(nd.mucDos[0].qs.nlc) || ''}</td>
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold">{countQuestions(nd.mucDos[1].qs.nlc) || ''}</td>
                <td className="border border-slate-200 p-2 text-emerald-700 font-bold">{countQuestions(nd.mucDos[2].qs.nlc) || ''}</td>
                {/* DS */}
                <td className="border border-slate-200 p-2 text-amber-700 font-bold">{countQuestions(nd.mucDos[0].qs.ds) * 1 || ''}</td>
                <td className="border border-slate-200 p-2 text-amber-700 font-bold">{countQuestions(nd.mucDos[0].qs.ds) * 2 || ''}</td>
                <td className="border border-slate-200 p-2 text-amber-700 font-bold">{countQuestions(nd.mucDos[0].qs.ds) * 1 || ''}</td>
                {/* TLN */}
                <td className="border border-slate-200 p-2 text-rose-700 font-bold">{countQuestions(nd.mucDos[1].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 text-rose-700 font-bold">{countQuestions(nd.mucDos[2].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 text-rose-700 font-bold">{countQuestions(nd.mucDos[3].qs.tln) || ''}</td>
                <td className="border border-slate-200 p-2 bg-slate-50 font-black">{rowTotal}</td>
              </tr>
            );
          }))}
          <tr className="bg-slate-900 text-white font-black text-center">
            <td colSpan={3} className="p-2">TỔNG CỘNG</td>
            <td colSpan={3}>{totals.p1}/12 câu</td>
            <td colSpan={3}>{totals.p2}/4 câu</td>
            <td colSpan={3}>{totals.p3}/6 câu</td>
            <td className="bg-indigo-600">{totals.total}</td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}

function TabDacTa({ data, countQuestions }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
      <h2 className="text-2xl font-black text-center mb-8 uppercase">BẢNG ĐẶC TẢ CHI TIẾT ĐỀ KIỂM TRA</h2>
      <table className="w-full border-collapse border border-slate-300 text-[10px]">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="border border-slate-700 p-2 w-10">STT</th>
            <th className="border border-slate-700 p-2 w-40">Nội dung</th>
            <th className="border border-slate-700 p-2 w-20">Mức độ</th>
            <th className="border border-slate-700 p-2">Yêu cầu cần đạt</th>
            <th className="border border-slate-700 p-2 w-16">NLC</th>
            <th className="border border-slate-700 p-2 w-16">Đúng/Sai</th>
            <th className="border border-slate-700 p-2 w-16">TL Ngắn</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c: any, cIdx: number) => c.noiDungs.map((nd: any, nIdx: number) => nd.mucDos.map((md: any, mIdx: number) => (
            <tr key={`${nIdx}-${mIdx}`} className="hover:bg-slate-50">
              {mIdx === 0 && <td rowSpan={4} className="border border-slate-200 p-2 text-center font-bold">{nIdx + 1}</td>}
              {mIdx === 0 && <td rowSpan={4} className="border border-slate-200 p-2 font-bold">{nd.tenNoiDung}</td>}
              <td className={`border border-slate-200 p-2 font-bold text-center ${LEVELS[mIdx].color}`}>{LEVELS[mIdx].name}</td>
              <td className="border border-slate-200 p-2 text-justify">{md.yeuCau || '---'}</td>
              <td className="border border-slate-200 p-2 text-center font-bold text-emerald-700">{md.qs.nlc || ''}</td>
              <td className="border border-slate-200 p-2 text-center font-bold text-amber-700">{mIdx === 0 ? (md.qs.ds || '') : ''}</td>
              <td className="border border-slate-200 p-2 text-center font-bold text-rose-700">{md.qs.tln || ''}</td>
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
          result.push({ phan: 'I', noiDung: `[${md.tenMucDo}] Câu hỏi trắc nghiệm về ${nd.tenNoiDung}...`, dapAn: 'A', tag: nd.tenNoiDung });
        }
      });
      // 2. Lọc lấy Đúng/Sai
      const nDS = countQuestions(nd.mucDos[0].qs.ds);
      for (let i = 0; i < nDS; i++) {
        result.push({ phan: 'II', noiDung: `Cho các mệnh đề về ${nd.tenNoiDung}: \na) Ý NB...\nb) Ý TH...\nc) Ý TH...\nd) Ý VD...`, dapAn: 'Đ S Đ S', tag: nd.tenNoiDung });
      }
      // 3. Lọc lấy Trả lời ngắn
      nd.mucDos.forEach((md: any, mIdx: number) => {
        const n = countQuestions(md.qs.tln);
        for (let i = 0; i < n; i++) {
          result.push({ phan: 'III', noiDung: `[${md.tenMucDo}] Tính toán giá trị của ${nd.tenNoiDung}...`, dapAn: '10', tag: nd.tenNoiDung });
        }
      });
    }));
    setExam(result);
  };

  return (
    <div className="space-y-6" ref={mathRef as any}>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-black">Sinh đề thi tự động</h2>
          <p className="text-xs text-slate-400">Đề thi được bốc chính xác theo nội dung và mức độ từ Bảng đặc tả</p>
        </div>
        <button onClick={handleGenerate} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
          <Sparkles className="w-5 h-5" /> TẠO ĐỀ NGAY
        </button>
      </div>

      {exam.length > 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-2xl max-w-[900px] mx-auto font-serif">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold uppercase">ĐỀ KIỂM TRA ĐỊNH KỲ</h3>
            <p className="italic">Thời gian làm bài: 90 phút</p>
          </div>
          
          <div className="space-y-8">
            <section>
              <h4 className="font-bold mb-4">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. (12 câu)</h4>
              {exam.filter(q => q.phan === 'I').map((q, i) => (
                <div key={i} className="mb-4 ml-4">
                  <p><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                  <p className="grid grid-cols-4 mt-2"><span>A. ...</span><span>B. ...</span><span>C. ...</span><span>D. ...</span></p>
                </div>
              ))}
            </section>

            <section>
              <h4 className="font-bold mb-4">PHẦN II. Câu trắc nghiệm đúng sai. (4 câu)</h4>
              {exam.filter(q => q.phan === 'II').map((q, i) => (
                <div key={i} className="mb-6 ml-4">
                  <p><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                </div>
              ))}
            </section>

            <section>
              <h4 className="font-bold mb-4">PHẦN III. Câu hỏi trắc nghiệm trả lời ngắn. (6 câu)</h4>
              {exam.filter(q => q.phan === 'III').map((q, i) => (
                <div key={i} className="mb-4 ml-4">
                  <p><strong>Câu {i + 1}.</strong> {q.noiDung}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Các Component giao diện nhỏ ---

function Header({ monHoc, setMonHoc, handleLogout }: any) {
  return (
    <header className="max-w-4xl mx-auto text-center mb-12">
      <p className="text-indigo-600 font-bold tracking-widest text-[10px] uppercase">Smarter Education Tools</p>
      <h1 className="text-4xl font-black text-slate-900 italic">Math Matrix <span className="text-indigo-600">Pro</span></h1>
      <div className="mt-4 flex justify-center gap-2">
        {['Toán', 'Lý', 'Hóa'].map(m => (
          <button key={m} onClick={() => setMonHoc(m)} className={`px-4 py-1 rounded-lg text-xs font-bold ${monHoc === m ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-500'}`}>{m}</button>
        ))}
        <button onClick={handleLogout} className="ml-4 text-xs font-bold text-rose-500 hover:underline">Đăng xuất</button>
      </div>
    </header>
  );
}

function Login({ handleLogin, user, setUser, pass, setPass }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md">
        <h1 className="text-3xl font-black text-white text-center mb-8">Math Matrix <span className="text-indigo-400">Pro</span></h1>
        <input className="w-full mb-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-400" placeholder="Tên đăng nhập" value={user} onChange={e => setUser(e.target.value)} />
        <input className="w-full mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-400" type="password" placeholder="Mật khẩu" value={pass} onChange={e => setPass(e.target.value)} />
        <button onClick={() => { if(user === 'Bui Thi Kiên' && pass === '12345') { localStorage.setItem('mmp_logged_in', 'true'); handleLogin(); } }} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">ĐĂNG NHẬP</button>
      </div>
    </div>
  );
}
