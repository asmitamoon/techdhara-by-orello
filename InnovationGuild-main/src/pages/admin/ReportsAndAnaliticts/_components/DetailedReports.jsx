import { useState } from 'react';
import {
  exportProblemsReport,
  exportInnovationsReport,
  exportVLEsReport,
  exportAOsReport,
  exportNOsReport,
} from '../../../../api/admin';

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const REPORTS = [
  { key: 'problems',    label: 'Problems Report',    desc: 'All registered problem statements',  fn: exportProblemsReport    },
  { key: 'innovations', label: 'Innovation Report',  desc: 'All registered innovations',         fn: exportInnovationsReport },
  { key: 'vles',        label: 'VLE Report',         desc: 'All registered VLEs',                fn: exportVLEsReport        },
  { key: 'aos',         label: 'AO Report',          desc: 'All affiliated organisations',       fn: exportAOsReport         },
  { key: 'nos',         label: 'NO Report',          desc: 'All nodal organisations',            fn: exportNOsReport         },
];

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function DetailedReports() {
  const [loading, setLoading] = useState({});

  const handleDownload = async (report) => {
    setLoading((prev) => ({ ...prev, [report.key]: true }));
    try {
      const blob = await report.fn();
      downloadBlob(blob, `${report.key}-report-${Date.now()}.csv`);
    } catch {
      // Error handled by axios interceptor
    } finally {
      setLoading((prev) => ({ ...prev, [report.key]: false }));
    }
  };

  return (
    <>
      <h2 className="text-3xl font-regular text-[#273228] mt-14 mb-1">Detailed Reports</h2>
      <p className="text-gray-500 text-sm mb-6">Download comprehensive CSV reports for each entity</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <div
            key={report.key}
            className="bg-white border border-accent-green-light rounded-2xl p-6 flex flex-col gap-4"
          >
            <div>
              <p className="text-base font-semibold text-[#273228]">{report.label}</p>
              <p className="text-sm text-gray-400 mt-1">{report.desc}</p>
            </div>
            <button
              onClick={() => handleDownload(report)}
              disabled={loading[report.key]}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-fit cursor-pointer"
            >
              <DownloadIcon />
              {loading[report.key] ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
